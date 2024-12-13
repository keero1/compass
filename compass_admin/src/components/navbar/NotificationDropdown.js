import { useState, useEffect } from "react";
import ClickOutside from "./ClickOutside";

// Firebase imports
import { db } from "../../firebase/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

import { useAuth } from "../../contexts/authContext";

const NotificationDropdown = () => {
  const { currentUser } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const [profileUpdateRequests, setProfileUpdateRequests] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [showMore, setShowMore] = useState(false);

  // adminlog
  const logAdminAction = async (action, details, busId) => {
    try {
      const adminId = currentUser.uid;

      await addDoc(collection(db, "adminLogs"), {
        action,
        busId,
        timestamp: new Date(),
        adminId,
        details,
      });
    } catch (error) {
      console.error("Error logging admin action: ", error);
    }
  };

  // use effect

  useEffect(() => {
    const unsubscribeRequests = fetchRequests();
    return () => {
      unsubscribeRequests();
    };
  }, []);

  const fetchRequests = () => {
    const requestsCollection = collection(db, "profileUpdateRequests");

    return onSnapshot(
      requestsCollection,
      (snapshot) => {
        const requestsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedRequests = requestsData.sort(
          (a, b) => b.requestTime.toDate() - a.requestTime.toDate()
        );

        setProfileUpdateRequests(sortedRequests);
      },
      (error) => {
        console.error("Error fetching profile update requests:", error);
      }
    );
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp.toDate().getTime()) / 1000);

    const timeUnits = [
      { limit: 60, divisor: 1, suffix: "second" },
      { limit: 3600, divisor: 60, suffix: "minute" },
      { limit: 86400, divisor: 3600, suffix: "hour" },
      { limit: Infinity, divisor: 86400, suffix: "day" },
    ];

    for (const { limit, divisor, suffix } of timeUnits) {
      if (seconds < limit) {
        const value = Math.floor(seconds / divisor);
        return `${value} ${suffix}${value !== 1 ? "s" : ""} ago`;
      }
    }
  };

  // approval
  const handleApproval = async () => {
    if (!selectedRequest) return;

    try {
      const requestDocRef = doc(
        db,
        "profileUpdateRequests",
        selectedRequest.id
      );
      await updateDoc(requestDocRef, { status: "approved" });

      const busDocRef = doc(db, "buses", selectedRequest.userId);
      await updateDoc(busDocRef, {
        bus_driver_name: selectedRequest.requestedDriverName,
      });

      await logAdminAction(
        "approve_profile_update",
        `approved profile update for for ${selectedRequest.requestedDriverName}`,
        selectedRequest.userId
      );

      console.log(`Approved request for ${selectedRequest.currentDriverName}`);
      closeModal();
    } catch (error) {
      console.error("Error updating request or bus:", error);
    }
  };

  // modal

  const openModal = (request) => {
    console.log("Request status:", request.status); // Log the status
    setSelectedRequest(request);
    const modal = document.getElementById("notification_modal");
    modal.showModal();
  };

  const closeModal = () => {
    const modal = document.getElementById("notification_modal");
    modal.close();
    setSelectedRequest(null);
  };

  const handleShowMore = () => {
    setShowMore((prevShowMore) => !prevShowMore);
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        className="btn btn-ghost btn-circle focus:outline-none"
        onClick={() => {
          setNotifying(false);
          setDropdownOpen(!dropdownOpen);
        }}
      >
        <div className="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            className={`badge badge-xs badge-primary indicator-item ${
              notifying === false ? "hidden" : ""
            }`}
          ></span>
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-base-100 shadow-lg py-2 z-[1] ">
          <div className="px-4 py-2 text-lg font-semibold border-b border-base-300">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {profileUpdateRequests === null ? (
              // Daisy UI skeleton
              <div className="flex flex-col gap-2 px-4 py-2">
                <div className="skeleton h-4 w-28"></div>
                <div className="skeleton h-4 w-full"></div>
              </div>
            ) : (
              <>
                {(showMore
                  ? profileUpdateRequests
                  : profileUpdateRequests.slice(0, 3)
                ).map((request) => (
                  <div
                    key={request.id}
                    className="px-4 py-2 border-b border-base-300 cursor-pointer hover:bg-base-200"
                    onClick={() => openModal(request)}
                  >
                    <p className="text-sm">
                      <strong>{request.currentDriverName}</strong> requested to
                      change name to{" "}
                      <strong>{request.requestedDriverName}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(request.requestTime)}
                    </p>
                  </div>
                ))}
                {profileUpdateRequests.length > 3 && (
                  <div className="px-4 text-center">
                    <button className="btn btn-link" onClick={handleShowMore}>
                      {showMore ? "Show less" : "Show more notifications"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Modal for Approve/Reject */}
      <dialog id="notification_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">
            {selectedRequest
              ? `${selectedRequest.currentDriverName}'s Request`
              : "Request"}
          </h3>
          <p>
            {selectedRequest ? `wants to update the name to ` : ""}
            <strong>
              {selectedRequest ? selectedRequest.requestedDriverName : ""}
            </strong>
          </p>
          <p>
            Status:{" "}
            <strong>{selectedRequest ? selectedRequest.status : ""}</strong>
          </p>
          <p>
            {selectedRequest ? formatTime(selectedRequest.requestTime) : ""}
          </p>
          {selectedRequest &&
            selectedRequest.status.toLowerCase() === "pending" && (
              <div className="modal-action">
                <button className="btn btn-primary" onClick={handleApproval}>
                  Approve
                </button>
                <button className="btn btn-secondary" onClick={closeModal}>
                  Reject
                </button>
              </div>
            )}
        </div>
      </dialog>
    </ClickOutside>
  );
};

export default NotificationDropdown;

import { useState, useEffect } from "react";
import ClickOutside from "./ClickOutside";

// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const NotificationDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const [profileUpdateRequests, setProfileUpdateRequests] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch profile update requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Access the 'profileUpdateRequests' collection from Firestore
        const requestsCollection = collection(db, "profileUpdateRequests");
        const requestsSnapshot = await getDocs(requestsCollection);

        // Extract data from each document and update the state
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id, // Save document ID
          ...doc.data(), // Spread the rest of the data
        }));

        setProfileUpdateRequests(requestsData); // Set the fetched data to state
      } catch (error) {
        console.error("Error fetching profile update requests:", error);
      }
    };

    fetchRequests();
  }, []); // Empty dependency array means this will run once when component mounts

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

      console.log(`Approved request for ${selectedRequest.currentDriverName}`);
      closeModal();
    } catch (error) {
      console.error("Error updating request or bus:", error);
    }
  };

  // modal

  const openModal = (request) => {
    console.log(request.userId);
    setSelectedRequest(request);
    const modal = document.getElementById("notification_modal");
    modal.showModal();
  };

  const closeModal = () => {
    const modal = document.getElementById("notification_modal");
    modal.close();
    setSelectedRequest(null);
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
          <div className="max-h-48 overflow-y-auto">
            {profileUpdateRequests.map((request) => (
              <div
                key={request.id}
                className="px-4 py-2 border-b border-base-300 cursor-pointer hover:bg-gray-200"
                onClick={() => openModal(request)}
              >
                <p className="text-sm">
                  <strong>{request.currentDriverName}</strong> requested to
                  change name to <strong>{request.requestedDriverName}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(request.requestTime)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 text-center">
            <button
              className="btn btn-link"
              onClick={() => console.log("See all recent activity clicked")}
            >
              See all recent activity
            </button>
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
          {selectedRequest && selectedRequest.status === "pending" && (
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

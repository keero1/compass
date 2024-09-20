import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase/firebase"; // Adjust path to Firebase configuration
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

import Frieren from "../../assets/images/frieren.png";

const BusView = () => {
  const navigate = useNavigate();
  const { busId } = useParams();

  const [routes, setRoutes] = useState([]);
  const [busData, setBusData] = useState({
    bus_driver_name: "",
    username: "",
    name: "",
    phone_number: "",
    route_id: "",
    license_plate: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all routes
  const fetchRoutes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "routes"));
      const routesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoutes(routesData);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  // Fetch the specific bus data
  const fetchBusData = async () => {
    try {
      const busDoc = await getDoc(doc(db, "buses", busId));
      if (busDoc.exists()) {
        setBusData(busDoc.data());
      } else {
        console.error("No such bus!");
      }
    } catch (error) {
      console.error("Error fetching bus data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // load on mount

  useEffect(() => {
    fetchRoutes();
    fetchBusData();
  }, []);

  const handleUpdateBus = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, "buses", busId), busData);
      alert("Bus account updated successfully!");
    } catch (error) {
      console.error("Error updating bus account:", error);
    } finally {
      setIsSaving(false);
      navigate(-1);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-base-200">
      <button
        className="absolute top-5 left-5 btn btn-primary"
        onClick={handleBackClick}
      >
        Back
      </button>

      <div className="w-full max-w-4xl flex flex-col items-center">
        {isLoading ? (
          <div className="relative w-24 h-24 mb-4">
            <div className="flex justify-center">
              <div className="skeleton rounded-full h-24 w-24"></div>
            </div>
          </div>
        ) : (
          <div className="relative w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 mb-4">
            <img
              src={Frieren}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />

            <button
              onClick={() => console.log("clicked")}
              className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full w-8 h-8 tooltip"
              data-tip="Change Picture"
            >
              +
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="w-full max-w-4xl bg-base-100 p-8 rounded-lg shadow-lg">
            <div className="skeleton h-8 w-64 mb-6"></div>{" "}
            {/* Title Skeleton */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="skeleton h-5 w-36 mb-2"></div>{" "}
                {/* Label Skeleton */}
                <div className="skeleton h-10 w-full"></div>{" "}
                {/* Input Skeleton */}
              </div>

              <div>
                <div className="skeleton h-5 w-36 mb-2"></div>{" "}
                {/* Label Skeleton */}
                <div className="skeleton h-10 w-full"></div>{" "}
                {/* Input Skeleton */}
              </div>

              <div>
                <div className="skeleton h-5 w-36 mb-2"></div>{" "}
                {/* Label Skeleton */}
                <div className="skeleton h-10 w-full"></div>{" "}
                {/* Input Skeleton */}
              </div>

              <div>
                <div className="skeleton h-5 w-36 mb-2"></div>{" "}
                {/* Label Skeleton */}
                <div className="skeleton h-10 w-full"></div>{" "}
                {/* Select Skeleton */}
              </div>

              <div>
                <div className="skeleton h-5 w-36 mb-2"></div>{" "}
                {/* Label Skeleton */}
                <div className="skeleton h-10 w-full"></div>{" "}
                {/* Input Skeleton */}
              </div>

              <div>
                <div className="skeleton h-5 w-36 mb-2"></div>{" "}
                {/* Label Skeleton */}
                <div className="skeleton h-10 w-full"></div>{" "}
                {/* Input Skeleton */}
              </div>
            </div>
            <div className="skeleton h-10 w-full mt-6"></div>{" "}
            {/* Button Skeleton */}
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-base-100 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">
              Update Bus Account
            </h2>
            <form onSubmit={handleUpdateBus}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Bus Driver Name
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter bus driver name"
                    disabled
                    value={busData.bus_driver_name}
                    onChange={(e) =>
                      setBusData({
                        ...busData,
                        bus_driver_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content">
                      (+63)
                    </div>
                    <input
                      type="tel"
                      className="input input-bordered pl-16 w-full"
                      placeholder="Enter phone number"
                      disabled
                      value={busData.phone_number}
                      onChange={(e) =>
                        setBusData({ ...busData, phone_number: e.target.value })
                      }
                      pattern="\d*"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Username
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter username"
                    disabled
                    value={busData.username}
                    onChange={(e) =>
                      setBusData({ ...busData, username: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Route
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={busData.route_id}
                    onChange={(e) =>
                      setBusData({ ...busData, route_id: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select route
                    </option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.route_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Bus Number
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter name"
                    disabled
                    value={busData.bus_number}
                    onChange={(e) =>
                      setBusData({ ...busData, bus_number: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    License Plate
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter license plate"
                    value={busData.license_plate}
                    onChange={(e) =>
                      setBusData({ ...busData, license_plate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className={`btn w-full mt-6 ${
                  isSaving ? "btn-disabled" : "btn-primary"
                }`}
              >
                {isSaving ? "Updating..." : "Update"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusView;

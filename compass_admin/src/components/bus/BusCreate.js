import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase/firebase"; // Adjust path to Firebase configuration
import { collection, getDocs, addDoc } from "firebase/firestore";

import { useAuth } from "../../contexts/authContext";

const BusCreate = () => {
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const [busName, setBusName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [route, setRoute] = useState("");
  const [busType, setBusType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [routes, setRoutes] = useState([]);
  const [totalBuses, setTotalBuses] = useState(0);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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

    const fetchTotalBuses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "buses"));
        setTotalBuses(querySnapshot.size + 1);
      } catch (error) {
        console.error("Error fetching total buses:", error);
      }
    };

    fetchRoutes();
    fetchTotalBuses();
  }, []);

  useEffect(() => {
    const generateUsername = () => {
      const formattedName = busName.replace(/\s+/g, "").toLowerCase();
      const numberFormat = totalBuses.toString().padStart(3, "0");
      const username = `${formattedName}.${numberFormat}`;
      setUsername(username);
    };

    if (busName) {
      generateUsername();
    } else {
      setUsername("");
    }
  }, [busName, totalBuses]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const logAdminAction = async (actionType, actionDetails) => {
    const adminID = currentUser.uid;
    try {
      await addDoc(collection(db, "adminLogs"), {
        actionType,
        actionDetails,
        adminID,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error logging admin action:", error);
    }
  };

  const handleCreateBus = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    const adminID = auth.currentUser.uid;

    try {
      const response = await fetch(
        "https://compass-backend-coral.vercel.app/api/create-bus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            busName,
            phoneNumber,
            busType,
            route,
            licensePlate,
            totalBuses,
            adminID,
          }),
        }
      );

      if (response.ok) {
        alert("Bus account created successfully");
        await logAdminAction("create_bus", `created bus account: ${busName}`);

        navigate(-1); // Go back to the previous page
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating bus account:", error);
      alert("Failed to create bus account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBusNameChange = (e) => {
    // Split the input value by spaces, capitalize each word, and join them back
    const value = e.target.value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setBusName(value);
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-base-200">
      <button
        className="absolute top-5 left-5 btn btn-primary"
        onClick={handleBackClick}
      >
        Back
      </button>

      <div className="w-full max-w-4xl bg-base-100 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Create Bus Account
        </h2>
        <form onSubmit={handleCreateBus}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-base-content">
                Bus Driver Name
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter Driver Name"
                value={busName}
                onChange={handleBusNameChange}
                required
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
                  value={phoneNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                    if (numericValue.length <= 10) {
                      setPhoneNumber(numericValue);
                    }
                  }}
                  pattern="9\d{9}"
                  title="Format: 9123456789"
                  required
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-base-content">
                Route
              </label>
              <select
                className="select select-bordered w-full"
                placeholder="Select route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
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
                Bus Type
              </label>
              <select
                className="select select-bordered w-full"
                placeholder="Select route"
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Buy Type
                </option>
                <option value="Aircon">Aircon</option>
                <option value="Ordinary">Ordinary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-base-content">
                License Plate
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter license plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
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
            {isSaving ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusCreate;

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
  const [licenseNumber, setLicenseNumber] = useState("");
  const [routes, setRoutes] = useState([]);
  const [availableLicenseNumbers, setAvailableLicenseNumbers] = useState([]); // Changed to hold objects
  const [busNumber, setBusNumber] = useState("");
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

    const fetchLicenseNumbers = async () => {
      try {
        const busInformationSnapshot = await getDocs(
          collection(db, "busInformation")
        );
        const busesSnapshot = await getDocs(collection(db, "buses"));

        // Get all license numbers and bus types from busInformation
        const licenseNumbers = busInformationSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            license_number: data.license_number, // Get license number
            bus_number: data.bus_number, // Get associated bus number
            bus_type: data.bus_type, // Include bus type
          };
        });

        // Get all existing bus license numbers
        const existingBusLicenseNumbers = busesSnapshot.docs.map(
          (doc) => doc.data().license_plate
        );

        // Filter out license numbers that already exist in the buses collection
        const filteredLicenseNumbers = licenseNumbers.filter(
          (item) => !existingBusLicenseNumbers.includes(item.license_number)
        );

        filteredLicenseNumbers.sort((a, b) => {
          return a.bus_number - b.bus_number; // Sort in ascending order
        });

        setAvailableLicenseNumbers(filteredLicenseNumbers); // Store filtered license numbers with their bus numbers
      } catch (error) {
        console.error("Error fetching license numbers:", error);
      }
    };

    fetchRoutes();
    fetchLicenseNumbers();
  }, []);

  useEffect(() => {
    // Generate username whenever busName or busNumber changes
    const generateUsername = () => {
      if (busName && busNumber) {
        const formattedName = busName.replace(/\s+/g, "").toLowerCase();
        const numberFormat = busNumber.toString().padStart(3, "0");
        const newUsername = `${formattedName}.${numberFormat}`;
        setUsername(newUsername);
      } else {
        setUsername(""); // Clear username if conditions are not met
      }
    };

    // Call the function to generate username
    generateUsername();
  }, [busName, busNumber]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const logAdminAction = async (action, details, busId) => {
    const adminId = currentUser.uid;
    try {
      await addDoc(collection(db, "adminLogs"), {
        action,
        busId,
        timestamp: new Date(),
        adminId,
        details,
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
            username,
            busName,
            phoneNumber,
            busType,
            route,
            licenseNumber,
            busNumber,
            adminID,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("Bus account created successfully");
        await logAdminAction(
          "create_bus",
          `created bus account: ${busName}`,
          data.busId
        );

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
    const value = e.target.value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setBusName(value);
  };

  const handleLicenseNumberChange = (e) => {
    const selectedNumber = e.target.value;
    setLicenseNumber(selectedNumber);

    // Find the bus information associated with the selected license number
    const selectedBusInfo = availableLicenseNumbers.find(
      (bus) => bus.license_number === selectedNumber
    );

    console.log("Selected Bus Info:", selectedBusInfo); // Debugging output
    const busNumber = selectedBusInfo ? selectedBusInfo.bus_number : "";
    const busType = selectedBusInfo ? selectedBusInfo.bus_type : ""; // Get the bus type
    console.log("Selected Bus Number:", busNumber); // Debugging output
    setBusNumber(busNumber); // Update bus number based on selection
    setBusType(busType); // Update bus type based on selection
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
          Create Driver Account
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
              <div className="input input-bordered w-full py-3 cursor-not-allowed">
                {/* Display the selected bus type */}
                {username || "Username"}
              </div>
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
              <div className="input input-bordered w-full py-3 cursor-not-allowed">
                {/* Display the selected bus type */}
                {busType || "Aircon"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-base-content">
                License Number
              </label>
              <select
                className="select select-bordered w-full"
                value={licenseNumber}
                onChange={handleLicenseNumberChange} // Updated to handle license number change
                required
              >
                <option value="" disabled>
                  Select License Number
                </option>
                {availableLicenseNumbers.map((number) => (
                  <option
                    key={number.license_number}
                    value={number.license_number}
                  >
                    {number.license_number}
                  </option>
                ))}
              </select>
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

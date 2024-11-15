import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../firebase/firebase"; // Adjust path to Firebase configuration
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { useAuth } from "../../contexts/authContext";

import Frieren from "../../assets/images/user_icon.png";

const BusView = () => {
  const navigate = useNavigate();
  const { busId } = useParams();
  const { currentUser } = useAuth();

  const [routes, setRoutes] = useState([]);
  const [busData, setBusData] = useState({
    bus_driver_name: "",
    username: "",
    name: "",
    phone_number: "",
    route_id: "",
    license_plate: "",
    profile_picture: "",
    bus_number: "",
  });
  const [originalBusData, setOriginalBusData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  //license
  const [availableLicenseNumbers, setAvailableLicenseNumbers] = useState([]);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [busType, setBusType] = useState("");
  const [busNumber, setBusNumber] = useState("");

  // image loading
  const [isImageLoading, setIsImageLoading] = useState(true);

  // reset password input
  const [inputName, setInputName] = useState("");

  //log

  const logAdminAction = async (action, details) => {
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
  const fetchBusData = useCallback(async () => {
    try {
      const busDoc = await getDoc(doc(db, "buses", busId));
      if (busDoc.exists()) {
        setBusData(busDoc.data());
        setOriginalBusData(busDoc.data());
        setPreviewImage(busDoc.data().profile_picture || Frieren);
        fetchLicenseNumbers(busDoc.data());

        //default values
        setBusType(busDoc.data().bus_type);
        setBusNumber(busDoc.data().bus_number);
      } else {
        console.error("No such bus!");
      }
    } catch (error) {
      console.error("Error fetching bus data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [busId]);

  const fetchLicenseNumbers = async (dataXD) => {
    try {
      const busInformationSnapshot = await getDocs(
        collection(db, "busInformation")
      );
      const busesSnapshot = await getDocs(collection(db, "buses"));

      const licenseNumbers = busInformationSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          license_number: data.license_number,
          bus_number: data.bus_number,
          bus_type: data.bus_type,
        };
      });

      // Get all existing bus license numbers
      const existingBusLicenseNumbers = busesSnapshot.docs.map(
        (doc) => doc.data().license_plate
      );

      // Filter out license numbers that already exist in the buses collection
      const filteredLicenseNumbers = licenseNumbers.filter((item) => {
        return (
          !existingBusLicenseNumbers.includes(item.license_number) ||
          dataXD.license_plate === item.license_number
        );
      });

      filteredLicenseNumbers.sort((a, b) => {
        return a.bus_number - b.bus_number; // Sort in ascending order
      });

      console.log(filteredLicenseNumbers);

      setAvailableLicenseNumbers(filteredLicenseNumbers); // Store filtered license numbers with their bus numbers
    } catch (error) {
      console.error("Error fetching license numbers:", error);
    }
  };

  // load on mount

  useEffect(() => {
    fetchRoutes();
    fetchBusData();
  }, [fetchBusData]);

  const handleUpdateBus = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    const routeChanged = busData.route_id !== originalBusData.route_id;
    try {
      if (selectedFile) {
        const profilePicRef = ref(storage, `profilePictures/${busId}`);
        await uploadBytes(profilePicRef, selectedFile);
        const profilePicUrl = await getDownloadURL(profilePicRef);
        busData.profile_picture = profilePicUrl;
      }

      console.log(routeChanged);

      await setDoc(doc(db, "buses", busId), busData);

      // if the route is changed, we update the busLocation also

      if (routeChanged) {
        const busLocationDocRef = doc(db, "busLocation", busId);

        const busLocationDoc = await getDoc(busLocationDocRef);

        if (busLocationDoc.exists()) {
          // If bus_id exists, update the route_id (cause when creating new account, they dont have data in busLocation yet it must be initialize when the app is logged in)
          await setDoc(
            busLocationDocRef,
            { route_id: busData.route_id },
            { merge: true }
          );
          console.log("Route ID updated in busLocation.");
        } else {
          console.log("Bus ID does not exist in busLocation collection.");
        }
      }

      alert("Bus account updated successfully!");

      await logAdminAction(
        "update_bus",
        `Updated bus details for ${busData.bus_driver_name}`
      );
    } catch (error) {
      console.error("Error updating bus account:", error);
    } finally {
      setIsSaving(false);
      navigate(-1);
    }
  };

  // license
  const handleLicenseNumberChange = (e) => {
    const selectedNumber = e.target.value;
    setLicenseNumber(selectedNumber);

    const selectedBusInfo = availableLicenseNumbers.find(
      (bus) => bus.license_number === selectedNumber
    );

    console.log("Selected Bus Info:", selectedBusInfo);
    const busType = selectedBusInfo ? selectedBusInfo.bus_type : "";
    const busNumber = selectedBusInfo ? selectedBusInfo.bus_number : "";
    setBusNumber(busNumber);
    setBusType(busType);
    setBusData((prevData) => ({
      ...prevData,
      license_plate: selectedNumber,
      bus_number: busNumber,
      bus_type: busType,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      setSelectedFile(file); // Set the selected file
      const reader = new FileReader(); // Create a FileReader to read the file
      reader.onloadend = () => {
        setPreviewImage(reader.result); // Set the preview image URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleResetPassword = async () => {
    const newPassword = `${busData.bus_driver_name
      .replace(/\s+/g, "")
      .toLowerCase()}${busData.bus_number}`;

    try {
      const response = await fetch(
        "https://compass-backend-coral.vercel.app/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: busId, // Assuming busId is the UID of the user
            newPassword: newPassword,
          }),
        }
      );

      if (response.ok) {
        alert("Password reset successfully!");
        setInputName(""); // Clear the input field
        document.getElementById("reset_password_modal").close(); //close the modal

        await logAdminAction(
          "reset_password",
          `Reset password for ${busData.bus_driver_name}`
        );
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  const hasDataChanged = () => {
    return (
      JSON.stringify(busData) !== JSON.stringify(originalBusData) ||
      busData.license_plate !== originalBusData.license_plate ||
      busNumber !== originalBusData.bus_number ||
      busType !== originalBusData.bus_type
    );
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
              src={previewImage} // Use the preview image
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              onLoad={handleImageLoad} // Call handleImageLoad when the image loads
              style={isImageLoading ? { display: "none" } : {}} // Hide the image if it's still loading
            />
            {isImageLoading && (
              <img
                src={Frieren}
                alt="Placeholder"
                className="w-full h-full object-cover rounded-full absolute top-0 left-0"
              />
            )}

            <label
              className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full w-8 h-8 tooltip cursor-pointer"
              data-tip="Change Picture"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" // Hide the default file input
              />
              +
            </label>
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
                  <div className="input input-bordered w-full py-3 cursor-not-allowed">
                    {/* Display the selected bus type */}
                    {busData.bus_driver_name || "bus driver name"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content">
                      (+63)
                    </div>
                    <div className="input input-bordered w-full pl-16 py-3 cursor-not-allowed">
                      {/* Display the selected bus type */}
                      {busData.phone_number || "9123456789"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Username
                  </label>
                  <div className="input input-bordered w-full py-3 cursor-not-allowed">
                    {/* Display the selected bus type */}
                    {busData.username || "username"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    Route <span className="text-red-500">*</span>
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
                    Bus Type
                  </label>
                  <div className="input input-bordered w-full py-3 cursor-not-allowed">
                    {/* Display the selected bus type */}
                    {busType || "Aircon"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-base-content">
                    License Plate <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={licenseNumber || busData.license_plate}
                    onChange={handleLicenseNumberChange}
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
                  isSaving || (!hasDataChanged() && !selectedFile)
                    ? "btn-disabled"
                    : "btn-primary"
                }`}
                disabled={isSaving || (!hasDataChanged() && !selectedFile)}
              >
                {isSaving ? "Updating..." : "Update"}
              </button>
            </form>
            <div className="mt-4">
              <button
                className="btn btn-secondary w-full"
                onClick={() =>
                  document.getElementById("reset_password_modal").showModal()
                }
                disabled={isSaving}
              >
                Reset password
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Password Reset Modal */}
      <dialog id="reset_password_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Reset Password</h3>
          <p className="py-4">
            Enter the <strong>{busData.bus_driver_name}</strong> to confirm
          </p>
          <input
            type="text"
            className="input input-bordered w-full mb-4"
            placeholder="Enter the bus driver name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)} // Update state on input change
          />
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => {
                // Logic to reset password
                if (inputName === busData.bus_driver_name) {
                  // Assuming the password logic here
                  console.log("Password reset for:", inputName);
                  handleResetPassword();
                } else {
                  alert("Name does not match!");
                  setInputName("");
                }
              }}
            >
              Confirm
            </button>
            <form method="dialog">
              <button
                className="btn"
                onClick={() => {
                  setInputName("");
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default BusView;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doCreateWithEmailAndPassword, doSignOut } from "../../firebase/auth"; // Adjust path to Firebase utility functions
import { db } from "../../firebase/firebase"; // Adjust path to Firebase configuration
import {
  collection,
  doc,
  Timestamp,
  getDocs,
  setDoc,
} from "firebase/firestore";

const BusCreate = () => {
  const navigate = useNavigate();
  const [busName, setBusName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [route, setRoute] = useState("");
  const [name, setName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [routes, setRoutes] = useState([]);

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

    fetchRoutes();
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const generateRandomString = (length) => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset[randomIndex];
    }
    return randomString;
  };

  const handleCreateBus = async (event) => {
    event.preventDefault(); // Prevent form submission if validation fails
    setIsSaving(true);
    try {
      const randomEmail = `busdriver_${generateRandomString(10)}@compass.org`;
      const password = "Password12!"; // Use a secure password in production

      // Create the user and get the user ID
      const userCredential = await doCreateWithEmailAndPassword(
        randomEmail,
        password
      );
      const userId = userCredential.user.uid;

      // Use the user ID as the document ID in Firestore
      await setDoc(doc(db, "buses", userId), {
        username: username,
        bus_driver_name: busName,
        phone_number: phoneNumber,
        route_id: route,
        name: name,
        license_plate: licensePlate,
        email: randomEmail,
        company_id: "ComPass XD",
        created_at: Timestamp.now(), // Use Timestamp.now() to get the current timestamp
      });

      alert("due to some bug for now. creating bus accounts will sign you off.");
      
      doSignOut();
    } catch (error) {
      console.error("Error creating bus account:", error);
    } finally {
      setIsSaving(false);
    }
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
                placeholder="Enter bus name"
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
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
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="\d*"
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
                Bus Name
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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

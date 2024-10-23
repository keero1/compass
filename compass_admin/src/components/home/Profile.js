import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { useAuth } from "../../contexts/authContext";
import User from "../../assets/images/user_icon.png";

// Firebase imports
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  doSignInWithEmailAndPassword,
  doPasswordChange,
} from "../../firebase/auth";

// Utility functions for local storage
const getCachedData = () => {
  const data = localStorage.getItem("companyData");
  return data ? JSON.parse(data) : null;
};

const setCachedData = (data) => {
  localStorage.setItem("companyData", JSON.stringify(data));
};

const getCachedUID = () => {
  return localStorage.getItem("companyUID");
};

const setCachedUID = (uid) => {
  localStorage.setItem("companyUID", uid);
};

const Profile = () => {
  const { currentUser } = useAuth(); // Assuming userLoggedIn contains userId
  const [companyData, setCompanyData] = useState({
    company_name: "",
    email: "",
    phone_number: "",
  });

  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);

  // Create a reference to the dialog
  const dialogRef = useRef(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (currentUser && currentUser.uid) {
        const cachedUID = getCachedUID();
        if (cachedUID === currentUser.uid) {
          const cachedData = getCachedData();
          if (cachedData) {
            console.log("Using cached data:");
            setCompanyData(cachedData);
            setFormData(cachedData);
            return;
          }
        }

        try {
          const docRef = doc(db, "company", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Fetched Company Data:");
            setCompanyData(data);
            setFormData(data);
            setCachedData(data);
            setCachedUID(currentUser.uid);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching company data: ", error);
        }
      }
    };

    fetchCompanyData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const refetchCompanyData = async () => {
    if (currentUser && currentUser.uid) {
      try {
        const docRef = doc(db, "company", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Refetched Company Data:");
          setCompanyData(data);
          setCachedData(data);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error refetching company data: ", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (JSON.stringify(formData) === JSON.stringify(companyData)) {
      console.log("No changes detected");
      return;
    }

    setLoading(true);

    if (currentUser && currentUser.uid) {
      try {
        const { email, ...dataToUpdate } = formData; // Exclude the email field from the update
        const docRef = doc(db, "company", currentUser.uid);
        await updateDoc(docRef, dataToUpdate);
        console.log("Document updated successfully!");
        refetchCompanyData();
      } catch (error) {
        console.error("Error updating document: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    handleReauth(oldPassword, newPassword, confirmPassword);
  };

  const handleReauth = async (oldPasswordX, newPasswordX, confirmPasswordX) => {
    setLoadingPassword(true);
    try {
      await doSignInWithEmailAndPassword(currentUser.email, oldPasswordX);

      if (newPasswordX === confirmPasswordX) {
        await doPasswordChange(newPasswordX);
        alert("Password updated successfully!");

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        dialogRef.current.close();
      } else {
        alert("Passwords do not match!");
      }
    } catch (error) {
      alert(
        "Error during re-authentication or updating password: " + error.message
      );
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="avatar mb-6 md:mb-0 md:mr-6">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={User} alt="Profile" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold mb-2">
              {companyData.company_name || "John Doe"}
            </h2>
            <p className="text-sm text-gray-500">
              {companyData.email || "company@email.com"}
            </p>
            <p className="text-sm text-gray-500">
              {"(+63)"} {companyData.phone_number || "9xxxxxxxxx"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="card shadow-lg compact bg-base-100">
            <div className="card-body">
              <h2 className="card-title">Account Details</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Company Name</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    placeholder="Enter Name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="company_email@example.com"
                    value={formData.email}
                    className="input input-bordered w-full"
                    disabled
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Phone Number</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content text-base">
                      (+63)
                    </div>
                    <input
                      type="text"
                      name="phone_number"
                      placeholder="Enter Phone Number"
                      value={formData.phone_number}
                      pattern="9\d{9}"
                      title="Format: 9123456789"
                      className="input input-bordered pl-14 w-full text-base"
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                        if (numericValue.length <= 10) {
                          setFormData((prevState) => ({
                            ...prevState,
                            phone_number: numericValue,
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>

              <div className="mt-4">
                <button
                  className="btn btn-secondary w-full"
                  onClick={() => dialogRef.current.showModal()} // Open the modal using ref
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Old Password</span>
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter Old Password"
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="input input-bordered"
                required
              />
            </div>
            <div className="modal-action">
              <button type="submit" className="btn" disabled={loadingPassword}>
                {loadingPassword ? "Updating..." : "Change Password"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  dialogRef.current.close();
                }}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default Profile;

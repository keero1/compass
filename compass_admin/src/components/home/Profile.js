import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import Frieren from "../../assets/images/frieren.png";

// Firebase imports
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
    setFormData(prevState => ({
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
    if (currentUser && currentUser.uid) {
      try {
        const docRef = doc(db, "company", currentUser.uid);
        await updateDoc(docRef, formData);
        console.log("Document updated successfully!");
        refetchCompanyData();
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="avatar mb-6 md:mb-0 md:mr-6">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={Frieren} alt="Profile" />
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
              {"0" + companyData.phone_number || "09xxxxxxxxx"}
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
                    placeholder="Santrans Inc."
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
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Phone Number</span>
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    placeholder="09xxxxxxxxx"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

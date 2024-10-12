import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({ ...user });
        setUserLoggedIn(true);
        await fetchUserRole(user.uid);
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
        setUserRole(""); // Clear user role when user logs out
        localStorage.removeItem("userRole"); // Remove role from localStorage on logout
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  async function fetchUserRole(uid) {
    try {
      const docRef = doc(db, "company", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserRole(data.role);
        localStorage.setItem("userRole", data.role); // Persist user role in localStorage
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user role: ", error);
    }
  }

  const value = {
    currentUser,
    userRole,
    userLoggedIn,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

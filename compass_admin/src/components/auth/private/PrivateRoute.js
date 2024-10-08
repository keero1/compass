import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";

import Navbar from "../../navbar/Navbar";

export const PrivateRoute = () => {
  const { userLoggedIn } = useAuth();

  return userLoggedIn ? (
    <>
      <Navbar />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

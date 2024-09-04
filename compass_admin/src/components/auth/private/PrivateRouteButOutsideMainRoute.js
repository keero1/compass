import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";

export const PrivateRouteButOutsideMainRoute = () => {
  const { userLoggedIn } = useAuth();

  return userLoggedIn ? (
    <>
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

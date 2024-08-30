import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";

import { PrivateRoute } from "./components/auth/private/PrivateRoute";

// auth
import Login from "./components/auth/login/Login";
//protected pages
import Home from "./components/home/Main";
import Wallet from "./components/home/Wallet";
import ManageDriver from "./components/home/ManageDriver";
import ManageRoute from "./components/home/ManageRoute";
// import NotFound from "./components/pages/NotFound";
import Profile from "./components/home/Profile";

import RouteView from "./components/route/RouteView";
import { PrivateRouteButOutsideMainRoute } from "./components/auth/private/PrivateRouteButOutsideMainRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/manage-driver" element={<ManageDriver />} />
            {/* route */}
            <Route path="/manage-route" element={<ManageRoute />} />
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/" element={<PrivateRouteButOutsideMainRoute />}>
            {/* route management pages */}
            <Route
              path="/manage-route/route-view/:routeId"
              element={<RouteView />}
            />
          </Route>
          {/* error 404*/}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

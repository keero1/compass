import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";

import { PrivateRoute } from "./components/auth/private/PrivateRoute";

// route view and bus driver account edit
import { PrivateRouteButOutsideMainRoute } from "./components/auth/private/PrivateRouteButOutsideMainRoute";

// auth
import Login from "./components/auth/login/Login";
//protected pages
import Home from "./components/home/Main";
import Wallet from "./components/home/Wallet";
import ManageDriver from "./components/home/ManageDriver";
import ManageRoute from "./components/home/ManageRoute";
// import NotFound from "./components/pages/NotFound";
import Profile from "./components/home/Profile";

// super admin
import AdminLogs from "./components/super-admin/AdminLogs";

import RouteView from "./components/route/RouteView";
import BusCreate from "./components/bus/BusCreate";
import BusView from "./components/bus/BusView";

import DownloadPage from "./components/download/DownloadPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/download-app" element={<DownloadPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/manage-driver" element={<ManageDriver />} />
            {/* route */}
            <Route path="/manage-route" element={<ManageRoute />} />
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            {/* super admin */}
            <Route path="/admin-logs" element={<AdminLogs />} />
          </Route>
          <Route path="/" element={<PrivateRouteButOutsideMainRoute />}>
            {/* no navbar pages */}
            <Route
              path="/manage-route/route-view/:routeId"
              element={<RouteView />}
            />
            <Route path="/manage-driver/create-bus" element={<BusCreate />} />
            <Route
              path="/manage-driver/bus-view/:busId"
              element={<BusView />}
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

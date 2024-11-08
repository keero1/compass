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

import ManageBus from "./components/bus/ManageBus";

// super admin
import AdminLogs from "./components/super-admin/AdminLogs";

import RouteView from "./components/route/RouteView";
import BusCreate from "./components/bus/BusCreate";
import BusView from "./components/bus/BusView";

import DownloadPage from "./components/download/DownloadPage";
import TermsOfUse from "./components/download/TermsOfUse";
import PrivacyPolicy from "./components/download/PrivacyPolicy";
import ManageConductor from "./components/home/ManageConductor";

import Download from "./components/download/Download";
import Tickets from "./components/home/Tickets";
import ManageAdmin from "./components/super-admin/ManageAdmins";
import Deleted from "./components/home/Deleted";
import ConductorPage from "./components/conductor/ConductorPage";
import ConductorDashboard from "./components/conductor/ConductorDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/conductor" element={<ConductorPage />} />
          <Route
            path="/conductor/dashboard/:conductorId"
            element={<ConductorDashboard />}
          />
          <Route path="/download-app" element={<DownloadPage />} />
          <Route
            path="/d/user"
            element={
              <Download fileUrl="https://drive.google.com/file/d/1ptCnp1AMXntv83di0F5O9mBWO71domT3/view?usp=sharing" />
            }
          />
          <Route
            path="/d/bus-driver"
            element={
              <Download fileUrl="https://drive.google.com/file/d/1oWoiX92fzftPTD7_v09UtNXWPvAg1we9/view?usp=sharing" />
            }
          />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/manage-driver" element={<ManageDriver />} />
            {/* route */}
            <Route path="/manage-route" element={<ManageRoute />} />
            <Route path="/manage-conductor" element={<ManageConductor />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/deleted-data" element={<Deleted />} />
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            {/* super admin */}
            <Route path="/admin-logs" element={<AdminLogs />} />
            <Route path="/manage-admins" element={<ManageAdmin />} />
          </Route>
          <Route path="/" element={<PrivateRouteButOutsideMainRoute />}>
            <Route path="/manage-bus" element={<ManageBus />} />
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

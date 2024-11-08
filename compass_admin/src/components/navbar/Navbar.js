import { Link, Outlet, useNavigate } from "react-router-dom";
import { doSignOut } from "../../firebase/auth";
import User from "../../assets/images/user_icon.png";
import { useEffect, useState } from "react";

import { useAuth } from "../../contexts/authContext";
import { db } from "../../firebase/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

import {
  ArrowLeftStartOnRectangleIcon,
  UserIcon,
  UsersIcon,
  HomeIcon,
  WalletIcon,
  TruckIcon,
  MapPinIcon,
  NewspaperIcon,
  UserGroupIcon,
  TicketIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { currentUser, userRole } = useAuth();

  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "nord");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);

  const [companyName, setCompanyName] = useState(
    localStorage.getItem("companyName") || "" // Load from localStorage if available
  );

  // load company name

  const fetchCompanyName = async (uid) => {
    try {
      const docRef = doc(db, "company", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompanyName(data.company_name);
        localStorage.setItem("companyName", data.company_name);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching company data: ", error);
    }
  };

  const listenForCompanyUpdates = (uid) => {
    const docRef = doc(db, "company", uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompanyName(data.company_name);
        localStorage.setItem("companyName", data.company_name);
      }
    });
    return unsubscribe;
  };

  useEffect(() => {
    let unsubscribe;
    if (currentUser && currentUser.uid) {
      if (!companyName) {
        fetchCompanyName(currentUser.uid);
      }
      unsubscribe = listenForCompanyUpdates(currentUser.uid);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, companyName]);

  // update theme

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleToggle = (e) => {
    const newTheme = e.target.checked ? "night" : "nord";
    setTheme(newTheme);
  };

  // Sync theme checkbox state with theme
  useEffect(() => {
    const themeCheckbox = document.querySelector("#theme-checkbox");
    if (themeCheckbox) {
      themeCheckbox.checked = theme === "night";
    }
  }, [theme]);

  // Close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true); // Open sidebar for larger screens
      } else {
        setIsSidebarOpen(false); // Close sidebar for small screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = () => {
    doSignOut().then(() => {
      localStorage.removeItem("companyName"); // Clear cache on logout
      navigate("/");
    });
  };

  return (
    <div className={`drawer ${isSidebarOpen ? "lg:drawer-open" : ""}`}>
      {/* Sidebar */}
      <input
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle peer"
        checked={isSidebarOpen}
        onChange={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div className="drawer-content">
        <div className="navbar bg-base-200 fixed top-0 left-0 right-0 z-10">
          <div className="flex-none">
            <label
              htmlFor="my-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
          </div>
          {/* <div className="flex-1 flex justify-center">
            <a className="btn btn-ghost text-xl">ComPass</a>
          </div> */}
          <div className="flex-1 flex justify-end">
            <label className="swap swap-rotate btn-ghost btn-circle">
              {/* this hidden checkbox controls the state */}
              <input
                id="theme-checkbox"
                type="checkbox"
                checked={theme === "night"}
                onChange={handleToggle}
              />

              {/* sun icon */}
              <svg
                className="swap-on h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              {/* moon icon */}
              <svg
                className="swap-off h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>
            {/* NOTIFICATION */}
            <NotificationDropdown />
            <div className="dropdown dropdown-end mr-5">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-8 rounded-full">
                  <img alt="User Profile" src={User} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-lg dropdown-content bg-base-100 z-[1] w-27 p-2 shadow"
              >
                {currentUser && (
                  <div className="p-2 border-b border-gray-300">
                    <div className="text-lg font-semibold">
                      {companyName || "ComPass User"}
                    </div>
                    <div className="text-sm">
                      {currentUser.email || "email"}
                    </div>
                  </div>
                )}
                <li>
                  <Link to="profile">
                    <UserIcon className="size-6" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button className="text-red-500" onClick={handleSignOut}>
                    <ArrowLeftStartOnRectangleIcon className="size-6" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* <main className={`flex-1 ${isSidebarOpen ? "m-5" : "ml-5"}`}> */}
        <main
          className={`flex-1 mt-12 ${
            isSidebarOpen && !isSmallScreen ? "ml-60" : "ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* menu list */}
      <div className="drawer-side lg:drawer-open lg:static lg:relative z-20">
        {isSidebarOpen ? (
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
        ) : (
          <></>
        )}
        <ul className="menu menu-lg min-h-full bg-base-200 w-64 rounded-r-lg fixed top-0 left-0 right-0 z-30">
          <li>
            <Link to="/">
              <h1 className="text-2xl">ComPass</h1>
            </Link>
          </li>

          <li>
            <Link to="/">
              <HomeIcon className="size-6" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/wallet">
              <WalletIcon className="size-6" />
              Wallet
            </Link>
          </li>
          <li>
            <Link to="manage-driver">
              <TruckIcon className="size-6" />
              Manage drivers
            </Link>
          </li>
          <li>
            <Link to="manage-route">
              <MapPinIcon className="size-6" />
              Manage routes
            </Link>
          </li>
          <li>
            <Link to="manage-conductor">
              <UsersIcon className="size-6" />
              Manage conductors
            </Link>
          </li>
          <li>
            <Link to="tickets">
              <TicketIcon className="size-6" />
              Support Tickets
            </Link>
          </li>
          {/* Super Admin Controls */}
          {userRole === "superadmin" && (
            <>
              <li className="mt-4 pointer-events-none">
                <h2 className="text-base">SUPER ADMIN</h2>
              </li>
              {/* <li>
                <Link>
                  <UsersIcon className="size-6" />
                  Manage admins
                </Link>
              </li> */}
              <li>
                <Link to="manage-admins">
                  <UserGroupIcon className="size-6" />
                  Manage Admins
                </Link>
              </li>
              <li>
                <Link to="deleted-data">
                  <TrashIcon className="size-6" />
                  Deleted Accounts
                </Link>
              </li>
              <li>
                <Link to="admin-logs">
                  <NewspaperIcon className="size-6" />
                  Admin logs
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;

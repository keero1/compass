import { Link, Outlet, useNavigate } from "react-router-dom";
import { doSignOut } from "../../firebase/auth";
import Frieren from "../../assets/images/frieren.png";
import { useEffect, useState } from "react";

import { useAuth } from "../../contexts/authContext";

import {
  ArrowLeftStartOnRectangleIcon,
  UserIcon,
  HomeIcon,
  WalletIcon,
  TruckIcon,
  MapPinIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

const Navbar = () => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "cupcake"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleToggle = (e) => {
    const newTheme = e.target.checked ? "dracula" : "cupcake";
    setTheme(newTheme);
  };

  // Sync theme checkbox state with theme
  useEffect(() => {
    const themeCheckbox = document.querySelector("#theme-checkbox");
    if (themeCheckbox) {
      themeCheckbox.checked = theme === "dracula";
    }
  }, [theme]);

  // Close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Adjust width as needed
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        <div className="navbar bg-base-200">
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
                checked={theme === "dracula"}
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
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img alt="Tailwind CSS Navbar component" src={Frieren} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-lg dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-27 p-2 shadow"
              >
                {currentUser && (
                  <div className="p-2 border-b border-gray-300">
                    <div className="text-lg font-semibold">
                      {currentUser.displayName || "name"}
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
                  <button
                    className="text-red-500"
                    onClick={() => {
                      doSignOut().then(() => {
                        navigate("/");
                      });
                    }}
                  >
                    <ArrowLeftStartOnRectangleIcon className="size-6" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* <main className={`flex-1 ${isSidebarOpen ? "m-5" : "ml-5"}`}> */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* menu list */}
      <div className="drawer-side lg:drawer-open lg:static lg:relative">
        {isSidebarOpen ? (
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
        ) : (
          <></>
        )}
        <ul className="menu menu-lg min-h-full bg-base-200 w-56 rounded-r-lg">
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
              Manage Drivers
            </Link>
          </li>
          <li>
            <Link to="manage-route">
              <MapPinIcon className="size-6" />
              Manage Routes
            </Link>
          </li>
          <li>
            <button>
              <Cog6ToothIcon className="size-6" />
              Settings
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
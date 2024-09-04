import { useState } from "react";
import ClickOutside from "./ClickOutside";

const NotificationDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        className="btn btn-ghost btn-circle focus:outline-none"
        onClick={() => {
          setNotifying(false);
          setDropdownOpen(!dropdownOpen);
        }}
      >
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
          <span
            className={`badge badge-xs badge-primary indicator-item ${
              notifying === false ? "hidden" : ""
            }`}
          ></span>
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-base-100 shadow-lg py-2 z-[1] ">
          <div className="px-4 py-2 text-lg font-semibold border-b border-base-300">
            Notifications
          </div>
          <div className="max-h-48 overflow-y-auto">
            <div className="px-4 py-2 border-b border-base-300">
              <p className="text-sm">User 1 requested to change name</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
            <div className="px-4 py-2 border-b border-base-300">
              <p className="text-sm">User 1 requested to reset password</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
            <div className="px-4 py-2 border-b border-base-300">
              <p className="text-sm">User 1 requested qweqjwdfasgydcqqwgecvqdsad</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="px-4 text-center">
            <button
              className="btn btn-link"
              onClick={() => console.log("See all recent activity clicked")}
            >
              See all recent activity
            </button>
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default NotificationDropdown;

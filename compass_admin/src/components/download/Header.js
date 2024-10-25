import React from "react";
import { useNavigate } from "react-router-dom";

function Header({ showLinks = true }) {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/download-app");
  };

  // const handleServicesClick = () => {
  //   console.log("Services clicked");
  // };

  // const handleGetAppClick = () => {
  //   console.log("Get the App clicked");
  // };

  return (
    <header className="w-full bg-base-300 py-6 px-20 flex flex-col md:flex-row items-center justify-between">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={handleNavigateHome}
      >
        ComPass
      </h1>
      {showLinks && (
        <div className="mt-2 md:mt-0 space-x-4 md:space-x-10">
          {/* <button
            onClick={handleServicesClick}
            className="link no-underline font-bold hover:text-primary transition duration-300"
          >
            Services
          </button>
          <button
            onClick={handleGetAppClick}
            className="link no-underline font-bold hover:text-primary transition duration-300"
          >
            Download
          </button> */}
        </div>
      )}
    </header>
  );
}

export default Header;

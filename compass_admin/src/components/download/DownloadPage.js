// DownloadPage.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function DownloadPage() {
  const navigate = useNavigate();

  const handleTermsClick = () => {
    navigate("/terms-of-use");
  };

  const handlePrivacyClick = () => {
    navigate("/privacy-policy");
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header showLinks={true} />
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Download Our Mobile Apps
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Compass User App */}
            <div className="card bg-base-300 shadow-xl p-6">
              <div className="card-body items-center text-center">
                <h2 className="card-title text-2xl font-bold">Compass User</h2>
                <p className="text-gray-600">
                  Download the Compass User app for Android. Track buses in
                  real-time and make payments easily for your trips.
                </p>
                <Link
                  to="/d/user"
                  download
                  className="btn btn-primary mt-4"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents event from bubbling
                    // Any additional click logic
                  }}
                >
                  Download Compass User APK
                </Link>
              </div>
            </div>

            {/* Compass Bus App */}
            <div className="card bg-base-300 shadow-xl p-6">
              <div className="card-body items-center text-center">
                <h2 className="card-title text-2xl font-bold">Compass Bus</h2>
                <p className="text-gray-600">
                  Download the Compass Bus app for Android. Accept payments from
                  users and share your location in real-time with them.
                </p>
                <Link
                  to="/d/bus-driver"
                  download
                  className="btn btn-primary mt-4"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents event from bubbling
                    // Any additional click logic
                  }}
                >
                  Download Compass Bus APK
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer
        onTermsClick={handleTermsClick}
        onPrivacyClick={handlePrivacyClick}
      />
    </div>
  );
}

export default DownloadPage;

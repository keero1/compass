// DownloadPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
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
                <a
                  href="https://drive.google.com/uc?export=download&id=1gR1KEtd8KECMLsfPDumJlx_qOlnvR936"
                  download
                  className="btn btn-primary mt-4"
                >
                  Download Compass User APK
                </a>
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
                <a
                  href="https://drive.google.com/uc?export=download&id=1KIuQWKvpg0ZV4EySkqJ-RP4HJoxdyvyn"
                  download
                  className="btn btn-primary mt-4"
                >
                  Download Compass Bus APK
                </a>
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

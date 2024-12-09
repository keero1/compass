import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

// Import the CSS file for animations
import "./fadeAnimations.css";

import appUI from "../../assets/images/app_ui_2.png";
import appIcon from "../../assets/images/app_icon.png";

function DownloadPage() {
  const navigate = useNavigate();

  const handleTermsClick = () => {
    navigate("/terms-of-use");
  };

  const handlePrivacyClick = () => {
    navigate("/privacy-policy");
  };

  useEffect(() => {
    // Create an Intersection Observer to detect visibility of sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // If the section is at least 50% visible, add the fade-in-visible class
            entry.target.classList.add("fade-in-visible");
            entry.target.classList.remove("fade-out-invisible");
          } else {
            // If the section is less than 50% visible, add the fade-out-invisible class
            entry.target.classList.add("fade-out-invisible");
            entry.target.classList.remove("fade-in-visible");
          }
        });
      },
      { threshold: 0.2 } // This makes the element visible only when 50% of it is in the viewport
    );

    const fadeElements = document.querySelectorAll(".fade-element");
    fadeElements.forEach((el) => observer.observe(el));

    return () => {
      fadeElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header showLinks={true} />

      {/* First Section: ComPass Header with Get the App */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-base-200 min-h-[80vh] fade-element fade-out-invisible">
        <img src={appIcon} alt="ComPass Logo" className="w-1/5 mb-6" />
        <h1 className="text-4xl font-bold mb-2 text-center">ComPass</h1>
        <p className="text-gray-600 mb-8 text-center">
          A Mobile Application to Enhance Public Bus Transportation
          through Real-Time Tracking and Cashless Payments
        </p>
        <a href="#download" className="btn btn-primary mt-4">
          Get the App
        </a>
      </div>

      {/* Second Section: Features */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 min-h-[90vh] fade-element fade-out-invisible">
        <h2 className="text-3xl font-semibold mb-10 text-center">Features</h2>
        <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-7xl">
          {/* Image on the Left */}
          <div className="flex-shrink-0 w-full md:w-1/3">
            <img
              src={appUI}
              alt="App UI"
              className="w-2/3 md:w-2/3 object-contain rounded-lg shadow-lg mx-auto"
            />
          </div>

          {/* Features on the Right */}
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-2 gap-8 w-full">
              {/* Feature 1: Real-time Bus Tracking */}
              <div className="flex flex-col items-center justify-center p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Real-Time Bus Tracking
                </h3>
                <p className="text-gray-600 text-center">
                  Track buses in real-time to know exactly when they'll arrive
                  at your location.
                </p>
              </div>

              {/* Feature 2: Cashless Payments */}
              <div className="flex flex-col items-center justify-center p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Cashless Payments
                </h3>
                <p className="text-gray-600 text-center">
                  Make payments seamlessly within the application for a smooth,
                  cashless experience.
                </p>
              </div>
            </div>

            {/* Divider between the two rows */}
            <div className="divider my-6"></div>

            <div className="grid grid-cols-2 gap-8 w-full">
              {/* Feature 3: Enhanced Security */}
              <div className="flex flex-col items-center justify-center p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Enhanced Security
                </h3>
                <p className="text-gray-600 text-center">
                  Enjoy peace of mind with driver identification and secure
                  payments.
                </p>
              </div>

              {/* Feature 4: Driver Identification */}
              <div className="flex flex-col items-center justify-center p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Driver Identification
                </h3>
                <p className="text-gray-600 text-center">
                  Verify the identity of the bus driver to ensure a safe and
                  reliable journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Section: Download App */}
      <div
        id="download"
        className="flex-grow flex flex-col items-center justify-center p-6 bg-base-200 min-h-[80vh] fade-element fade-out-invisible"
      >
        <h2 className="text-3xl font-semibold mb-4 text-center">
          Download the App
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Download the ComPass app today to start enjoying all the amazing
          features.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Download for Passengers */}
          <div className="card bg-base-300 shadow-xl p-6 fade-element fade-out-invisible">
            <div className="card-body items-center text-center">
              <h3 className="card-title text-2xl font-semibold mb-4">
                For Passengers
              </h3>
              <p className="text-gray-600 mb-4">
                Download ComPass for Passengers on Android. Track buses in
                real-time and make payments easily for your trips.
              </p>
              <Link to="/d/user" className="btn btn-primary" download>
                Download for Passengers
              </Link>
            </div>
          </div>

          {/* Download for Drivers */}
          <div className="card bg-base-300 shadow-xl p-6 fade-element fade-out-invisible">
            <div className="card-body items-center text-center">
              <h3 className="card-title text-2xl font-semibold mb-4">
                For Drivers
              </h3>
              <p className="text-gray-600 mb-4">
                Download ComPass for Drivers on Android. Accept payments from
                users and share your location in real-time.
              </p>
              <Link to="/d/bus-driver" className="btn btn-primary" download>
                Download for Drivers
              </Link>
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

import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

import { useNavigate } from "react-router-dom";

function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header showLinks={false} />
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <main className="flex-grow flex flex-col items-center justify-center bg-base-100">
          <div className="w-full max-w-5xl bg-base-300 p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold mb-4 text-left">
              Privacy Policy
            </h1>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">1. Introduction</h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                Welcome to ComPass, a mobile application designed to facilitate
                Bus Tracking for commuters. By using our app, you agree to
                comply with these Terms and Conditions. If you do not agree with
                any part of these Terms, please do not use the service.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                2. Information We Collect
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['2.1'] before:mr-1 font-semibold">
                  License: {""}
                </span>
                ComPass grants you a limited, non-exclusive, non-transferable,
                and revocable license to use the app for personal and
                non-commercial purposes, subject to these Terms.
              </p>
              <p>
                <span className="before:content-['2.2'] before:mr-1 font-semibold">
                  Account Creation: {""}
                </span>
                To use certain features of the app, you will need to create an
                account by providing accurate and up-to-date personal
                information. You are responsible for maintaining the
                confidentiality of your login credentials.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>
            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                3. How We Use Your Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  Bus Tracking: {""}
                </span>
                ComPass provides a platform for passengers to track upcoming
                buses. The actual buses are provided by Santrans Bus
                Corporation.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  Service Disclaimer: {""}
                </span>
                ComPass is not responsible for the accuracy of the bus schedules
                provided by Santrans.
              </p>
            </div>
            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                10. Contact Information
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                <span className="before:content-['12.1'] before:mr-1 font-semibold">
                  Email: {""}
                </span>
                support@compass.com
              </p>
              <p>
                <span className="before:content-['12.2'] before:mr-1 font-semibold">
                  Phone Number: {""}
                </span>
                (+63) 9565109939
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer
        onTermsClick={() => navigate("/terms-of-use")}
        onPrivacyClick={() => navigate("/privacy-policy")}
      />
    </div>
  );
}

export default PrivacyPolicy;

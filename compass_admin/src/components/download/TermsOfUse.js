import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

import { useNavigate } from "react-router-dom";

function TermsOfUsePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "ComPass - Terms of Use"; // Set the document title here
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header showLinks={false} />
      <main className="flex-grow flex flex-col items-center justify-center px-8 py-12 bg-base-100">
        <div className="w-full max-w-5xl bg-base-300 p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-semibold mb-4 text-left">
            Terms and Conditions of Use
          </h1>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">1. Introduction</h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              Welcome to ComPass, a mobile application designed to facilitate
              Bus Tracking for commuters. By using our app, you agree to comply
              with these Terms and Conditions. If you do not agree with any part
              of these Terms, please do not use the service.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">
              2. License and Account Creation
            </h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['2.1'] before:mr-1 font-semibold">
                License: {""}
              </span>
              ComPass grants you a limited, non-exclusive, non-transferable, and
              revocable license to use the app for personal and non-commercial
              purposes, subject to these Terms.
            </p>
            <p>
              <span className="before:content-['2.2'] before:mr-1 font-semibold">
                Account Creation: {""}
              </span>
              To use certain features of the app, you will need to create an
              account by providing accurate and up-to-date personal information.
              You are responsible for maintaining the confidentiality of your
              login credentials.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">3. Services Provided</h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['3.1'] before:mr-1 font-semibold">
                Real-Time Bus Tracking: {""}
              </span>
              ComPass provides a platform for passengers to track upcoming
              buses. The actual buses are provided by Santrans Bus Corporation.
            </p>
            <p>
              <span className="before:content-['3.2'] before:mr-1 font-semibold">
                Cashless Payments: {""}
              </span>
              The app offers secure and convenient cashless payment options for
              passengers.
            </p>
            <p>
              <span className="before:content-['3.3'] before:mr-1 font-semibold">
                Notification System: {""}
              </span>
              Users can set a marker in the app to receive notifications when
              the bus is nearby.
            </p>

            <p>
              <span className="before:content-['3.4'] before:mr-1 font-semibold">
                Security Features: {""}
              </span>
              The system includes security features such as driver
              identification information, enhancing passenger safety.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">4. Payments and Fees</h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['4.1'] before:mr-1 font-semibold">
                Payment: {""}
              </span>
              Payment for rides are exclusively handled by the Bus Driver. The
              application only shows the amount to be paid by the passenger
              whether it be cash or cashless.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">
              5. Driver Responsibilities
            </h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['5.1'] before:mr-1 font-semibold">
                Liability: {""}
              </span>
              Drivers are employees of Santrans Corporation in which are ComPass
              providing the service for. ComPass is not responsible for any
              accidents, injuries, or disputes between driver, and passengers.
            </p>
            <p>
              <span className="before:content-['5.1'] before:mr-1 font-semibold">
                Driver Identification: {""}
              </span>
              ComPass ensures that all drivers are verified Santrans employees.
              However, users must also verify the driver's identity through the
              app before starting the ride.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">
              6. User Responsibilities
            </h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['6.1'] before:mr-1 font-semibold">
                Appropriate Conduct: {""}
              </span>
              Users are expected to behave in a respectful and lawful manner
              while using the app and during the ride. Any form of misconduct,
              harassment, or illegal behavior is strictly prohibited.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">7. Privacy</h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              ComPass respects your privacy and is committed to protecting your
              personal information. Please refer to our Privacy Policy for more
              details on how we collect, use, and protect your data.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">
              8. Limitation of Liability
            </h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['8.1'] before:mr-1 font-semibold">
                {""}
              </span>
              ComPass is not liable for any damages, losses, or injuries
              resulting from the use of the app or the services provided by
              third-party drivers.
            </p>
            <p>
              <span className="before:content-['8.2'] before:mr-1 font-semibold">
                {""}
              </span>
              The app may experience technical issues or downtime, and ComPass
              is not responsible for any inconvenience this may cause.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">
              9. Modifications to the Terms
            </h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              ComPass reserves the right to modify these Terms and Conditions at
              any time. Any changes will be posted in the app, and continued use
              of the app after such changes constitutes acceptance of the new
              Terms.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">10. Termination</h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['10.1'] before:mr-1 font-semibold">
                {""}
              </span>
              ComPass reserves the right to suspend or terminate your account at
              any time if you violate these Terms or engage in behavior that
              negatively impacts the app or its users.
            </p>
            <p>
              <span className="before:content-['10.2'] before:mr-1 font-semibold">
                {""}
              </span>
              Users may also terminate their accounts by contacting customer
              support.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">11. Governing Law</h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the Philippines. Any disputes arising out of or in
              connection with these Terms will be subject to the exclusive
              jurisdiction of the courts in Bulacan.
            </p>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-1">
              12. Contact Information
            </h2>
            <div
              className="divider"
              style={{ margin: "0", marginBottom: "10px" }}
            ></div>
            <p>
              <span className="before:content-['12.1'] before:mr-1 font-semibold">
                Email: {""}
              </span>
              keero.dev@gmail.com
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
      <Footer
        onTermsClick={() => navigate("/terms-of-use")}
        onPrivacyClick={() => navigate("/privacy-policy")}
      />
    </div>
  );
}

export default TermsOfUsePage;

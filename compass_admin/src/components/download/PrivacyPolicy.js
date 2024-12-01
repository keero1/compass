import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

import { useNavigate } from "react-router-dom";

function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "ComPass - Privacy Policy";
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
                ComPass respects your privacy and is committed to protecting
                your personal data. This Privacy Policy explains how we collect,
                use, and disclose your personal information when you use the
                ComPass mobile application and related services. By using our
                App, you consent to the collection and use of your information
                as outlined in this Privacy Policy. This Privacy Policy complies
                with the Data Privacy Act of 2012 (RA 10173) of the Philippines.
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
                We collect the following types of information to provide you
                with a seamless experience on ComPass:
              </p>
              <p className="text-xl mt-3">
                <span className="before:content-['A.'] before:mr-1 font-semibold">
                  Personal Information
                </span>
              </p>
              <p>
                <span className="before:content-['2.1'] before:mr-1 font-semibold">
                  Account Information: {""}
                </span>
                When you sign up for ComPass, we collect personal data such as
                name and email address.
              </p>
              <p>
                <span className="before:content-['2.2'] before:mr-1 font-semibold">
                  Location Data: {""}
                </span>
                To offer ride-hailing services, we collect and process your
                real-time location through GPS technology. This allows us to
                match you with nearby upcoming bus including the marker you
                placed to notify you.
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xl mt-3">
                <span className="before:content-['B.'] before:mr-1 font-semibold">
                  Driver Information
                </span>
              </p>
              <p>
                <span className="before:content-['2.3'] before:mr-1 font-semibold">
                  Driver Profile: {""}
                </span>
                For drivers using the platform, we collect personal information
                such as driver's name, license plate, and phone number.
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xl mt-3">
                <span className="before:content-['C.'] before:mr-1 font-semibold">
                  Usage Data
                </span>
              </p>
              <p>
                <span className="before:content-['2.4'] before:mr-1 font-semibold">
                  App Usage: {""}
                </span>
                We may collect information about your interactions within the
                app.
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
                We use the information we collect for the following purposes:
              </p>
              <p className="mt-3">
                <span className="before:content-['3.1'] before:mr-1 font-semibold">
                  To Provide the Service: {""}
                </span>
                We use your information to connect passengers with the bus and
                process ride payments.
              </p>
              <p>
                <span className="before:content-['3.2'] before:mr-1 font-semibold">
                  To Improve the App: {""}
                </span>
                We analyze your usage data to enhance app functionality, improve
                user experience, and develop new features.
              </p>
              <p>
                <span className="before:content-['3.3'] before:mr-1 font-semibold">
                  To Ensure Safety and Security: {""}
                </span>
                We use location and identification data to verify bus driver
                identities and track bus in real time.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                4. Data Sharing and Disclosure
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                We may share your information with the following parties under
                these circumstances:
              </p>
              <p className="text-xl mt-3">
                <span className="before:content-['A.'] before:mr-1 font-semibold">
                  Third-Party Service Providers
                </span>
              </p>
              <p>
                We share data with trusted third-party partners that help us
                provide the service, such as:
              </p>
              <p>
                <span className="before:content-['4.1'] before:mr-1 font-semibold">
                  Map Providers:{""}
                </span>
                For GPS and routing system.
              </p>
              <p>
                <span className="before:content-['4.2'] before:mr-1 font-semibold">
                  Payment Gateway Providers:{""}
                </span>
                For cashless payment processing.
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xl mt-3">
                <span className="before:content-['B.'] before:mr-1 font-semibold">
                  Legal Obligations
                </span>
              </p>
              <p>
                We may disclose your information if required by law, such as in
                response to a court order, legal process, or law enforcement
                request, or to protect our legal rights and the safety of users.
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xl mt-3">
                <span className="before:content-['C.'] before:mr-1 font-semibold">
                  Business Transactions
                </span>
              </p>
              <p>
                In the event of a merger, acquisition, or sale of assets, we may
                transfer your data to the acquiring entity.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                5. Data Storage and Security
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                While we strive to protect your data, no method of transmission
                over the Internet or mobile networks is 100% secure. We are
                committed to promptly addressing any breaches in data security.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">6. Data Retention</h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                We retain your personal data for as long as necessary to provide
                our services and fulfill the purposes outlined in this Privacy
                Policy. Ride and payment information will be retained for legal
                and business purposes, including accounting and fraud
                prevention.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">7. Your Rights</h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                Under the Data Privacy Act of 2012, you have the following
                rights concerning your personal data:
              </p>
              <p className="mt-3">
                <span className="before:content-['7.1'] before:mr-1 font-semibold">
                  Access: {""}
                </span>
                You have the right to request access to your personal data that
                we hold.
              </p>
              <p>
                <span className="before:content-['7.2'] before:mr-1 font-semibold">
                  Rectification: {""}
                </span>
                You can request the correction of inaccurate or incomplete data.
              </p>
              <p>
                <span className="before:content-['7.3'] before:mr-1 font-semibold">
                  Erasure: {""}
                </span>
                Under certain conditions, you can request the deletion of your
                personal data.
              </p>
              <p>
                <span className="before:content-['7.4'] before:mr-1 font-semibold">
                  Objection: {""}
                </span>
                You may object to the processing of your data for purposes not
                directly related to the services provided.
              </p>
              <p>
                <span className="before:content-['7.5'] before:mr-1 font-semibold">
                  Portability: {""}
                </span>
                You have the right to request a copy of your data in a
                structured, commonly used, and machine-readable format.
              </p>

              <p className="mt-3">
                To exercise your rights, please contact us at
                johnjoshua.dev@gmail.com
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                8. Third-Party Links
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                Our App may contain links to third-party websites or services.
                This Privacy Policy applies only to TricyCall. We are not
                responsible for the privacy practices or content of third-party
                services.
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-1">
                9. Updates to this Privacy Policy
              </h2>
              <div
                className="divider"
                style={{ margin: "0", marginBottom: "10px" }}
              ></div>
              <p>
                We may update this Privacy Policy from time to time. Any changes
                will be posted in the app, and we will notify you of significant
                updates. Your continued use of the app after such changes will
                constitute your acknowledgment of the updated Privacy Policy.
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
      </div>
      <Footer
        onTermsClick={() => navigate("/terms-of-use")}
        onPrivacyClick={() => navigate("/privacy-policy")}
      />
    </div>
  );
}

export default PrivacyPolicy;

import React, { useState } from "react";
import { Navigate } from "react-router-dom";

// auth
import {
  doSignInWithEmailAndPassword,
  doPasswordReset,
} from "../../../firebase/auth";
import { useAuth } from "../../../contexts/authContext";

// firestore
import { db } from "../../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// image
import backgroundImage from "../../../assets/images/santrans.jpg";

// icons
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons

// css
import "./Login.css";

const Login = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const trimmedEmail = email.trim();

        const companyRef = collection(db, "company");
        const q = query(
          companyRef,
          where("email", "==", trimmedEmail.toLowerCase())
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(
            "Oops! Something went wrong. Please check your credentials and try again."
          );
        }
        await doSignInWithEmailAndPassword(email, password);
      } catch (error) {
        setErrorMessage(error.message);
        document.getElementById("alert_modal").showModal();
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const onSubmitForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const trimmedEmail = email.trim();
      const companyRef = collection(db, "company");
      const q = query(
        companyRef,
        where("email", "==", trimmedEmail.toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("This email does not exist in our records.");
      }

      await doPasswordReset(trimmedEmail);
      alert("Password reset email sent! Please check your inbox.");
      setIsForgotPassword(false); // Optionally reset the form or close modal
    } catch (error) {
      setErrorMessage(error.message);
      document.getElementById("alert_modal").showModal();
    }
  };

  if (userLoggedIn) {
    return <Navigate to={"/home"} replace={true} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Background Image */}
      <div
        className="hidden md:block md:w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Login Form */}
      <div className="w-full md:w-1/3 p-8 flex items-center justify-center h-full">
        <div className="w-full max-w-md min-w-[300px]">
          <div className="bg-base-200 text-base-content p-8 rounded-lg shadow-lg w-full">
            {!isForgotPassword ? (
              <>
                <h3 className="text-2xl font-semibold mb-6">ComPass Login</h3>
                <form onSubmit={onSubmit}>
                  <div className="mb-4">
                    <label className="block text-base-content mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input input-bordered w-full bg-base-300 text-base-content"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-base-content mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input input-bordered w-full bg-base-300 text-base-content pr-12"
                      />
                      <span
                        className="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 text-right">
                    <div
                      className="text-primary hover:underline cursor-pointer"
                      onClick={() => {
                        setEmail("");
                        setPassword("");
                        setIsForgotPassword(true);
                      }} // Open forgot password form
                    >
                      Forgot Password?
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`btn w-full ${
                      isSigningIn ? "btn-disabled" : "btn-primary"
                    }`}
                  >
                    {isSigningIn ? "Signing In..." : "Sign In"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold mb-6">Forgot Password</h3>
                <form onSubmit={onSubmitForgotPassword}>
                  <div className="mb-4">
                    <label className="block text-base-content mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input input-bordered w-full bg-base-300 text-base-content"
                    />
                  </div>

                  <button type="submit" className="btn w-full btn-primary">
                    Send Password Reset Link
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <div
                    className="text-primary hover:underline cursor-pointer"
                    onClick={() => {
                      setEmail("");
                      setIsForgotPassword(false);
                    }} // Go back to login form
                  >
                    Back to Login
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <dialog id="alert_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Login failed!</h3>
          <p className="py-4">{errorMessage}</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Login;

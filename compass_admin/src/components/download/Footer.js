import React from "react";

function Footer({ onTermsClick, onPrivacyClick }) {
  return (
    <footer className="w-full bg-base-300 py-4 text-center">
      <div className="space-x-10">
        <button
          onClick={onTermsClick}
          className="link link-hover underline font-bold hover:text-primary transition duration-300"
        >
          Terms of Use
        </button>
        <button
          onClick={onPrivacyClick}
          className="link link-hover underline font-bold hover:text-primary transition duration-300"
        >
          Privacy Policy
        </button>
      </div>
      <p className="mt-2">© 2024 ComPass. All Rights Reserved.</p>
    </footer>
  );
}

export default Footer;

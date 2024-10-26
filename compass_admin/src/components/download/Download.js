import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Download({ fileUrl }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.href = fileUrl;

    // Redirect after a timeout (optional)
    const timer = setTimeout(() => {
      navigate("/download-app"); // Redirect to home or another page
    }); // Adjust the time as necessary

    return () => clearTimeout(timer);
  }, [fileUrl, navigate]);

  return (
    <div>
      <h2>Your download will start shortly...</h2>
      <p>
        If it doesn't, <a href={fileUrl}>click here</a>.
      </p>
    </div>
  );
}

export default Download;

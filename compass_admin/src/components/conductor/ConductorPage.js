import React, { useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import jsQR from "jsqr"; // QR Code decoder library
import { useNavigate } from "react-router-dom";

// Custom hook for handling drag and drop
const useDropzone = (onDrop) => {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      onDrop(file);
    }
  };

  return {
    dragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

const ConductorPage = () => {
  const [qrCode, setQrCode] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [conductorName, setConductorName] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setQrCode(URL.createObjectURL(file));
      decodeQRCode(file);
    }
  };

  const decodeQRCode = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          try {
            const { id, name, user_id } = JSON.parse(code.data);
            if (!id || !user_id || !name) {
              console.error("Missing required data from QR code:", code.data);
              return;
            }

            setScannedData({ id, name, user_id });
            setConductorName(name);

            queryFirestore(id);
          } catch (error) {
            console.error("Error parsing QR code data:", error);
          }
        } else {
          console.log("No QR code found in the image.");
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const queryFirestore = async (conductor_id) => {
    try {
      const conductorDocRef = doc(db, "conductors", conductor_id);
      const docSnap = await getDoc(conductorDocRef);

      if (docSnap.exists()) {
        setShowModal(true);
      } else {
        console.log("No conductor found with this ID.");
      }
    } catch (error) {
      console.error("Error checking Firestore:", error);
    }
  };

  const handleProceed = () => {
    setShowModal(false);
    navigate(`/conductor/dashboard/${scannedData.id}`);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const { dragging, handleDragOver, handleDragLeave, handleDrop } =
    useDropzone(handleFileChange);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <h1 className="text-4xl font-bold mb-4">Conductor Login</h1>
      <p className="text-center text-gray-600 mb-6">
        Upload your QR code image here.
      </p>

      {/* QR Code Upload Area */}
      <div
        className={`w-96 h-48 border-4 border-dashed p-4 rounded-lg flex justify-center items-center ${
          dragging ? "border-primary bg-gray-100" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-gray-500 text-lg"
        >
          {qrCode ? (
            <img
              src={qrCode}
              alt="QR Code"
              className="w-32 h-32 object-contain"
            />
          ) : (
            <p>Drag & Drop or Click to Upload QR Code</p>
          )}
        </label>
      </div>

      {/* Modal Confirmation */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-2xl mb-4">Hello, {conductorName}</h2>
            <p className="text-lg mb-4">Do you want to proceed?</p>
            <div className="flex justify-around">
              <button
                className="btn btn-primary"
                onClick={handleProceed}
              >
                Yes
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional actions or information */}
      <div className="mt-6">
        <button className="btn btn-primary">Submit</button>
      </div>
    </div>
  );
};

export default ConductorPage;

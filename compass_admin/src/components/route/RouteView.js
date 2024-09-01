import React, { useState, useEffect } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useNavigate, useParams } from "react-router-dom";

//polyline
import { Polyline } from "./components/polyline.tsx";

// firebase
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import noLandMarkStyle from "../../styles/map/noLandMarkStyle.json";

// calculate the route for polyline
import { getRoute } from "./components/RoutesUtils.js";

import redMarker from "../../assets/images/pins/pin_red.png";
import blueMarker from "../../assets/images/pins/pin_blue.png";

const RouteView = () => {
  const API_KEY = process.env.REACT_APP_MAP_KEY;
  const navigate = useNavigate();
  const { routeId } = useParams(); // Extract routeId from URL

  const [mapDefault] = useState({
    center: { lat: 14.703238, lng: 121.096888 },
    zoom: 10,
  });

  const [routeData, setRouteData] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDataCopy, setRouteDataCopy] = useState();

  // dialogue text
  const [title, setTitle] = useState(null);
  const [placeholder_text, setPlaceholder_text] = useState(null);

  // data
  const [isChangedX, setIsChangedX] = useState(false);
  const [isChangedMarker, setIsChangedMarker] = useState(false);

  // edit markers
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);

  const EDITING_TEXT = "Are you sure you want to edit this route's markers?";
  const CANCEL_TEXT =
    "Are you sure you want to cancel? Your changes will not be saved.";

  useEffect(() => {
    if (routeId) {
      const fetchRouteData = async () => {
        try {
          const routeDocRef = doc(db, "routes", routeId);
          const routeDoc = await getDoc(routeDocRef);

          if (routeDoc.exists()) {
            setRouteData(routeDoc.data());
            setRouteDataCopy(routeDoc.data());
            const coordinates = routeDoc
              .data()
              .keypoints.map((point) => [point.latitude, point.longitude]);

            const route = await getRoute(coordinates);
            const routeCoordinates = route.map((coord) => ({
              lat: coord.latitude,
              lng: coord.longitude,
            }));

            setRouteCoordinates(routeCoordinates);
            // get middle marker coordinate

            // const middleIndex = Math.floor(routeCoordinates.length / 2);
            // const middleMarker = routeCoordinates[middleIndex];
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error processing route:", error);
        }
      };

      fetchRouteData();
    }
  }, [routeId]);


  // toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const onMapClick = (event) => {
    if (!isEditing) return;

    console.log(isChangedMarker);

    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    const newMarker = { latitude: lat, longitude: lng };

    setRouteDataCopy((prevData) => {
      const updatedKeypoints = [...prevData.keypoints, newMarker];
      setIsChangedMarker(true);
      return { ...prevData, keypoints: updatedKeypoints };
    });
  };
  const handleNameClick = () => {
    console.log("name click");
    document.getElementById("modal_route_view").showModal();

    setTitle("Route Name");
    setPlaceholder_text(routeDataCopy.route_name);
  };

  const handleDescriptionClick = () => {
    console.log("description click");
    document.getElementById("modal_route_view").showModal();

    setTitle("Description");
    setPlaceholder_text(routeDataCopy.description);
  };

  const handleMarkerClick = (index) => {
    console.log(`Marker ${index + 1} clicked`);

    if (!isEditing) {
      return;
    }

    setSelectedMarkerIndex(index);
    document.getElementById("marker_delete_modal").showModal();
  };

  const handleDeleteMarker = () => {
    if (selectedMarkerIndex === null) return;

    setRouteDataCopy((prevData) => {
      const updatedKeypoints = prevData.keypoints.filter(
        (_, index) => index !== selectedMarkerIndex
      );
      setIsChangedMarker(true);
      return { ...prevData, keypoints: updatedKeypoints };
    });

    document.getElementById("marker_delete_modal").close();
    setSelectedMarkerIndex(null);
  };

  const handleBackClick = () => {
    if (isEditing || isChangedX) {
      if (
        !window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        return;
      }
    }

    navigate(-1);
  };

  const onSaveClick = async () => {
    console.log("save");
    if (!routeId) return; // Ensure routeId is available

    const userConfirmed = window.confirm(
      "Are you sure with the changes you made?"
    );

    if (!userConfirmed) {
      return;
    }

    try {
      const routeDocRef = doc(db, "routes", routeId);
      await updateDoc(routeDocRef, {
        route_name: routeDataCopy.route_name,
        description: routeDataCopy.description,
        keypoints: routeDataCopy.keypoints,
      });
      console.log("Route updated successfully!");
      setIsChangedMarker(false);
      setIsChangedX(false);
      setIsEditing(false);
      navigate(-1);
    } catch (error) {
      console.error("Error updating route:", error);
    }
  };

  // edit the marker

  const onEditClick = () => {
    document.getElementById("confirm_edit_modal").close();
    setIsEditing(!isEditing);
    if (!isEditing) {
      setShowToast(true);
    }
    // Revert to original markers when exiting edit mode
    setRouteDataCopy((prevDataCopy) => ({
      ...prevDataCopy,
      keypoints: routeData.keypoints, // Use stored original markers
    }));

    setIsChangedMarker(false);
    setSelectedMarkerIndex(null);
  };

  // save form
  const [inputValue, setInputValue] = useState("");
  const handleSave = (e) => {
    e.preventDefault();

    if (inputValue.trim() === "") {
      alert("Input cannot be empty.");
      return;
    }

    setRouteDataCopy((prevData) => {
      console.log(title);
      if (title === "Route Name") {
        setIsChangedX(true);
        return { ...prevData, route_name: inputValue };
      } else if (title === "Description") {
        setIsChangedX(true);
        return { ...prevData, description: inputValue };
      } else {
        return prevData;
      }
    });

    setInputValue("");

    document.getElementById("modal_route_view").close();
  };

  // prompt when leaving if editing

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isEditing || isChangedX) {
        const message =
          "You have unsaved changes. Are you sure you want to reload?";
        event.preventDefault();
        event.returnValue = message; // Most browsers require this to display a confirmation dialog
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditing, isChangedX]);

  // highlighted

  const getMarkerIcon = (index) => {
    if (index === selectedMarkerIndex) {
      return blueMarker; // Example of highlighted icon
    }
    return redMarker; // Example of default icon
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative h-screen">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={mapDefault.center}
          defaultZoom={mapDefault.zoom}
          maxZoom={20}
          minZoom={12}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          keyboardShortcuts={false}
          onClick={onMapClick}
          options={{
            styles: noLandMarkStyle,
          }}
        >
          {routeDataCopy?.keypoints.map((point, index) => (
            <Marker
              key={index}
              position={{ lat: point.latitude, lng: point.longitude }}
              onClick={() => handleMarkerClick(index)}
              icon={getMarkerIcon(index)}
            />
          ))}
          {!isEditing && <Polyline path={routeCoordinates} />}
        </Map>
        <button
          className="absolute top-5 left-5 btn btn-primary"
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className="absolute bottom-5 right-5 btn btn-primary"
          onClick={onSaveClick}
          disabled={!isChangedX && !isChangedMarker}
        >
          Save
        </button>
        <button
          className="absolute bottom-5 right-28 btn btn-secondary"
          onClick={() =>
            document.getElementById("confirm_edit_modal").showModal()
          }
        >
          {isEditing ? "Cancel Edit" : "Edit Markers"}
        </button>
        {/* Toast */}
        {showToast && (
          <div className="toast toast-top toast-center">
            <div className="alert alert-info">
              <span>
                You are now editing the markers. Make sure they are positioned
                incrementally next to each other to ensure they connect properly
                on the map.
              </span>
            </div>
            <div className="alert alert-success">
              <span>
                Use the left pane to properly manage the markers by clicking
                them to know if they are positioned correctly.
              </span>
            </div>
          </div>
        )}
        <div className="absolute right-5 top-5 p-4 bg-base-100 border border-base-300 rounded-lg shadow-lg">
          {routeDataCopy ? (
            <div>
              <h3 className="text-lg font-bold px-2">Route Name</h3>
              <p
                onClick={() => handleNameClick()}
                className="px-2 cursor-pointer hover:bg-base-300 rounded-lg"
              >
                {routeDataCopy.route_name}
              </p>

              <h3 className="text-lg font-bold px-2 mt-4">Description</h3>
              <p
                onClick={() => handleDescriptionClick()}
                className="w-48 whitespace-nowrap overflow-hidden text-ellipsis px-2 cursor-pointer hover:bg-base-300 rounded-lg"
              >
                {routeDataCopy.description}
              </p>

              <h3 className="text-lg font-bold px-2 mt-4">Routes</h3>
              <ul className="max-h-48 overflow-y-auto p-0 list-none">
                {routeDataCopy.keypoints.map((point, index) => (
                  <li
                    key={index}
                    onClick={() => handleMarkerClick(index)}
                    className="cursor-pointer hover:bg-base-300 px-2 rounded-lg mt-1"
                  >
                    {`Marker ${index + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex w-52 flex-col gap-4">
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-28"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* modal for info edit */}
      <dialog id="modal_route_view" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          <form
            method="dialog"
            className="modal-action w-full"
            onSubmit={handleSave}
            autoComplete="off"
          >
            <div className="flex items-center w-full">
              <input
                type="text"
                name="routeInput"
                placeholder={placeholder_text}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="input input-bordered flex-grow mr-2"
              />
              <button type="submit" className="btn mx-3">
                Save
              </button>
            </div>
            <button
              type="button" // Prevents this button from submitting the form
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setInputValue("");
                document.getElementById("modal_route_view").close();
              }}
            >
              ✕
            </button>
          </form>
        </div>
      </dialog>

      {/* modal for edit confirmation */}
      <dialog id="confirm_edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {isEditing ? "Confirm Edit" : "Confirm Cancel"}
          </h3>
          <p>{isEditing ? CANCEL_TEXT : EDITING_TEXT}</p>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={onEditClick}>
              Confirm
            </button>
            <button
              className="btn btn-secondary"
              onClick={() =>
                document.getElementById("confirm_edit_modal").close()
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
      <dialog id="marker_delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Marker Actions</h3>
          <p>Do you want to delete this marker?</p>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleDeleteMarker}>
              Delete
            </button>
            <button
              className="btn btn-secondary"
              onClick={() =>
                document.getElementById("marker_delete_modal").close()
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </APIProvider>
  );
};

export default RouteView;

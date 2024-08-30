import React, { useState, useEffect, useRef } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

//firebase
import { db } from "../../firebase/firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

import noLandMarkStyle from "../../styles/map/noLandMarkStyle.json";

const Main = () => {
  const API_KEY = process.env.REACT_APP_MAP_KEY;

  const [mapCache, setMapCache] = useState({
    center: { lat: 14.77908927, lng: 121.06667698 }, // default values
    zoom: 15,
  });

  const [markers, setMarkers] = useState([]);
  const markersRef = useRef(markers);

  const mapRef = useRef(null);

  useEffect(() => {
    const loadMapCache = () => {
      if (mapRef.current) {
        mapRef.current.setCenter(mapCache.center);
        mapRef.current.setZoom(mapCache.zoom);
      }
    };

    loadMapCache();
  }, [mapCache]);

  // bus location

  useEffect(() => {
    console.log("effect triggered");
    const busLocationCollection = collection(db, "busLocation");

    const unsubscribe = onSnapshot(busLocationCollection, async (snapshot) => {
      console.log("snapshot triggered");
      const now = new Date();

      const newMarkers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const busId = doc.id; // Assuming the document ID is the bus ID
          const busDetails = await fetchBusDetails(busId);

          return {
            lat: data.coordinates.latitude,
            lng: data.coordinates.longitude,
            timestamp: data.timestamp.toDate(),
            id: busId, // Include the bus ID
            details: busDetails, // Include the bus details
          };
        })
      ).then((markers) =>
        markers.filter((marker) => {
          const timestampDiff = (now - marker.timestamp) / 1000 / 60; // Difference in minutes
          return timestampDiff <= 5; // Keep markers with timestamp <= 5 minutes old
        })
      );

      markersRef.current = newMarkers;
      setMarkers(newMarkers);
    });

    return () => unsubscribe();
  }, []);
  // check for offline
  useEffect(() => {
    console.log("effect triggered (interval check)");
    // Check every minute
    const intervalId = setInterval(() => {
      console.log("interval triggered");
      const now = new Date();
      const updatedMarkers = markersRef.current.filter((marker) => {
        const timestampDiff = (now - marker.timestamp) / 1000 / 60; // Difference in minutes
        return timestampDiff <= 5; // Keep markers with timestamp <= 5 minutes old
      });
      setMarkers(updatedMarkers);
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  // fetch data

  const fetchBusDetails = async (busId) => {
    console.log("fetching bus details");
    try {
      const busDoc = doc(db, "buses", busId); // Adjust the collection name if needed
      const busSnapshot = await getDoc(busDoc);

      if (busSnapshot.exists()) {
        return busSnapshot.data();
      } else {
        console.log("No such bus!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching bus details:", error);
      return null;
    }
  };

  // map load

  const handleMapLoad = (mapInstance) => {
    mapRef.current = mapInstance;

    mapInstance.setCenter(mapCache.center);
    mapInstance.setZoom(mapCache.zoom);

    // style
    mapInstance.setOptions({ styles: noLandMarkStyle });

    mapInstance.addListener("center_changed", () => {
      const center = mapInstance.getCenter();
      setMapCache((prevCache) => ({
        ...prevCache,
        center: { lat: center.lat(), lng: center.lng() },
      }));
    });

    mapInstance.addListener("zoom_changed", () => {
      const zoom = mapInstance.getZoom();
      setMapCache((prevCache) => ({
        ...prevCache,
        zoom,
      }));
    });
  };

  // marker

  useEffect(() => {
    if (mapRef.current) {
      markers.forEach(({ lat, lng, id }) => {
        new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map: mapRef.current,
          title: id, // Store the ID in the marker's title or another property
        });
      });
    }
  }, [markers]);

  const handleMarkerClick = (marker) => {
    console.log("Marker clicked:", marker);

    if (marker.details) {
      // Update the modal content with bus details
      document.getElementById("modal_title").textContent =
        marker.details.name || "No Name";
      document.getElementById(
        "modal_license_plate"
      ).textContent = `License Plate: ${marker.details.license_plate || "N/A"}`;
    } else {
      document.getElementById("modal_title").textContent =
        "Bus details not available";
    }

    document.getElementById("modal_popup").showModal();
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex h-screen">
        <div className="flex-1">
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={mapCache.center}
            defaultZoom={mapCache.zoom}
            maxZoom={20}
            minZoom={12}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
            onLoad={handleMapLoad}
            keyboardShortcuts={false}
            options={{
              styles: noLandMarkStyle,
            }}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}
          </Map>
        </div>
      </div>
      <dialog id="modal_popup" className="modal">
        <div className="modal-box">
          <h3 id="modal_title" className="font-bold text-lg">
            Bus Details
          </h3>
          <p id="modal_license_plate" className="py-4"></p>
          <p className="py-4">Press ESC key or click outside to close</p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </APIProvider>
  );
};

export default Main;

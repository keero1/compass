import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";

//firebase
import { db } from "../../firebase/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import noLandMarkStyle from "../../styles/map/noLandMarkStyle.json";

import Frieren from "../../assets/images/frieren.png";
import bus1 from "../../assets/images/bus1_final.svg";
import bus2 from "../../assets/images/bus2_final.png";

import "./Main.css";

//collection
const routesCollection = collection(db, "routes");

const Main = () => {
  const API_KEY = process.env.REACT_APP_MAP_KEY;

  const [mapDefault] = useState({
    center: { lat: 14.77908927, lng: 121.06667698 }, // default values
    zoom: 15,
  });

  const [markers, setMarkers] = useState([]);
  const markersDataRef = useRef(markers);

  //marker reference
  const markerInstancesRef = useRef([]);

  // for infowindow
  const [infoWindowOpen, setInfoWindowOpen] = useState(null);

  const [imageCache, setImageCache] = useState({});

  // route
  const [routes, setRoutes] = useState([]);

  const mapRef = useRef(null);

  const [clickedMarkerIndex, setClickedMarkerIndex] = useState(null);

  // bus location

  // fetch data
  const fetchBusDetails = async (busId) => {
    console.log("fetching bus details");
    try {
      const busDoc = doc(db, "buses", busId); 
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

  useEffect(() => {
    console.log("effect triggered");
    const busLocationCollection = collection(db, "busLocation");

    const unsubscribe = onSnapshot(busLocationCollection, async (snapshot) => {
      console.log("snapshot triggered");
      // const now = new Date();

      const newMarkers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const busId = doc.id; // Assuming the document ID is the bus ID
          const busDetails = await fetchBusDetails(busId);

          if (
            busDetails?.profile_picture &&
            !imageCache[busDetails.profile_picture]
          ) {
            const img = new Image();
            img.src = busDetails.profile_picture;
            img.onload = () => {
              setImageCache((prev) => ({
                ...prev,
                [busDetails.profile_picture]: img.src,
              }));
            };
          }

          return {
            lat: data.coordinates.latitude,
            lng: data.coordinates.longitude,
            timestamp: data.timestamp.toDate(),
            speed: data.speed,
            id: busId, // Include the bus ID
            details: busDetails, // Include the bus details
          };
        })
      );
      // .then((markers) =>
      //   markers.filter((marker) => {
      //     const timestampDiff = (now - marker.timestamp) / 1000 / 60; // Difference in minutes
      //     return timestampDiff <= 5; // Keep markers with timestamp <= 5 minutes old
      //   })
      // );

      markersDataRef.current = newMarkers;
      setMarkers(newMarkers);
    });

    return () => unsubscribe();
  }, [imageCache]);

  // interval to refresh buses (incase offline)
  // useEffect(() => {
  //   console.log("effect triggered (interval check)");

  //   const intervalId = setInterval(() => {
  //     console.log("interval triggered");
  //     const now = new Date();
  //     const updatedMarkers = markersDataRef.current.filter((marker) => {
  //       const timestampDiff = (now - marker.timestamp) / 1000 / 60; // Difference in minutes
  //       return timestampDiff > 5; // Keep markers with timestamp <= 5 minutes old
  //     });
  //     setMarkers(updatedMarkers);
  //   }, 60000); // 60,000 ms = 1 minute

  //   return () => clearInterval(intervalId); // Clear interval on component unmount
  // }, []);

  //route
  const fetchRouteData = async () => {
    try {
      const querySnapshot = await getDocs(routesCollection);
      const fetchedRoutes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.route_name,
        };
      });
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Error fetching route data:", error);
    }
  };

  useEffect(() => {
    fetchRouteData();
  }, []);

  const getRouteName = (route_id) => {
    const route = routes.find((r) => r.id === route_id);
    return route ? route.name : "Unknown";
  };

  // storing marker info
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

  // click handlers

  const handleMarkerClick = (index) => {
    setClickedMarkerIndex(index); // Track the clicked marker index
    setInfoWindowOpen({
      details: markers[index].details,
      speed: markers[index].speed,
       timestamp: markers[index].timestamp.toLocaleString(),
      markerRef: markerInstancesRef.current[index],
    });
  };

  const handleHoverMouse = (index) => {
    const markerRef = markerInstancesRef.current[index];
    setInfoWindowOpen({
      details: markers[index].details,
      speed: markers[index].speed,
      timestamp: markers[index].timestamp.toLocaleString(),
      markerRef,
    });
  };

  const handleMouseOut = () => {
    // Close the InfoWindow only if a marker hasn't been clicked
    if (clickedMarkerIndex === null) {
      setInfoWindowOpen(null);
    }
  };

  const onMapClick = () => {
    setInfoWindowOpen(null);
    setClickedMarkerIndex(null);
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex h-screen">
        <div className="flex-1">
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={mapDefault.center}
            defaultZoom={mapDefault.zoom}
            maxZoom={20}
            minZoom={12}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
            keyboardShortcuts={false}
            options={{
              styles: noLandMarkStyle,
            }}
            onClick={onMapClick}
          >
            {markers.map((marker, index) => {
              // Determine the appropriate bus icon based on the route ID
              const icon =
                marker.details.route_id === routes[0].id
                  ? {
                      url: bus1, // URL to the icon
                      scaledSize: new window.google.maps.Size(40, 40), // Resize the icon
                    }
                  : {
                      url: bus2, // URL to the icon
                      scaledSize: new window.google.maps.Size(40, 40), // Resize the icon
                    };

              return (
                <Marker
                  key={index}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  onMouseOver={() => handleHoverMouse(index)}
                  onMouseOut={handleMouseOut}
                  onClick={() => handleMarkerClick(index)}
                  ref={(el) => (markerInstancesRef.current[index] = el)}
                  icon={icon} // Set the icon for the marker
                />
              );
            })}

            {infoWindowOpen && (
              <InfoWindow
                anchor={infoWindowOpen.markerRef}
                onCloseClick={() => setInfoWindowOpen(null)}
                disableAutoPan
              >
                <div>
                  <div className="avatar flex justify-center mb-2">
                    <div className="w-24 rounded-full overflow-hidden">
                      <img
                        src={
                          imageCache[infoWindowOpen.details.profile_picture] ||
                          Frieren
                        }
                        className="object-cover"
                        alt="Profile"
                      />
                    </div>
                  </div>
                  <div className="text-center text-sm whitespace-nowrap">
                    <p>
                      <strong>Bus Driver:</strong>{" "}
                      {infoWindowOpen.details.bus_driver_name}
                    </p>
                    {infoWindowOpen.details.conductor_name && (
                      <p>
                        <strong>Conductor:</strong>{" "}
                        {infoWindowOpen.details.conductor_name}
                      </p>
                    )}
                    <p>
                      <strong>Phone Number:</strong>
                      {"(+63) "}
                      {infoWindowOpen.details.phone_number}
                    </p>
                    <p>
                      <strong>Route:</strong>{" "}
                      {getRouteName(infoWindowOpen.details.route_id)}
                    </p>
                    <p>
                      <strong>License:</strong>{" "}
                      {infoWindowOpen.details.license_plate}
                    </p>
                    <p>
                      <strong>Seat Taken:</strong>{" "}
                      {infoWindowOpen.details.seat_count} / 56
                    </p>
                    <p>
                      <strong>Speed:</strong>{" "}
                      {isNaN(infoWindowOpen.speed)
                        ? 0
                        : Math.round(infoWindowOpen.speed / 10) * 10}{" "}
                      KM/h
                    </p>
                    <p>
                      <strong>Last Updated:</strong> {infoWindowOpen.timestamp}
                    </p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </div>
    </APIProvider>
  );
};

export default Main;

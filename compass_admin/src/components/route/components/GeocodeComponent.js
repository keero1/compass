import React, { useMemo, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const GeocodeComponent = ({ position, onGeocodeResult }) => {
  const geocodingLib = useMapsLibrary("geocoding");
  const geocoder = useMemo(
    () => geocodingLib && new geocodingLib.Geocoder(),
    [geocodingLib]
  );
  useEffect(() => {
    if (geocoder && position) {
      geocoder.geocode(
        { location: { lat: position.latitude, lng: position.longitude } },
        (results, status) => {
          if (status === "OK" && results[0]) {
            onGeocodeResult(results[0].formatted_address);
          } else {
            console.error("Geocoder failed due to:", status);
          }
        }
      );
    }
  }, [geocoder, position]);

  return null;
};

export default GeocodeComponent;

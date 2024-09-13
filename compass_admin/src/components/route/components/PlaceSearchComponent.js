import { useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";

const PlaceSearchComponent = ({ setMapCenter, setMapZoom }) => {
  const [inputValue, setInputValue] = useState("");
  const mapsLibrary = useMapsLibrary("places");

  const handleSearch = (e) => {
    e.preventDefault();

    if (mapsLibrary && inputValue.trim()) {
      const service = new mapsLibrary.PlacesService(
        document.createElement("div") // A dummy element for the PlacesService
      );

      service.textSearch({ query: inputValue }, (results, status) => {
        if (
          status === mapsLibrary.PlacesServiceStatus.OK &&
          results.length > 0
        ) {
          const place = results[0]; // Take the first result
          if (place.geometry && place.geometry.location) {
            setMapCenter({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
            setMapZoom(17);

            // camera gets stuck when center and/or zoom has value. https://github.com/visgl/react-google-maps/issues/425
            setTimeout(() => {
              setMapCenter(null);
              setMapZoom(null);
            });
          }
        } else {
          console.error("No results found or request failed");
        }
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e); // Call handleSearch on Enter key press
    }
  };

  return (
    <div>
      <input
        id="place-input"
        type="text"
        placeholder="Search Place"
        className="input input-bordered w-full"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
      <MagnifyingGlassIcon
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 cursor-pointer"
        onClick={handleSearch}
      />
    </div>
  );
};

export default PlaceSearchComponent;

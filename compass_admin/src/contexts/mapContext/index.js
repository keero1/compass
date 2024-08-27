import React, { createContext, useContext, useState, useEffect } from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [mapData, setMapData] = useState(() => {
    const cachedData = localStorage.getItem("mapData");
    return cachedData ? JSON.parse(cachedData) : null;
  });

  useEffect(() => {
    if (mapData) {
      localStorage.setItem("mapData", JSON.stringify(mapData));
    }
  }, [mapData]);

  return (
    <MapContext.Provider value={{ mapData, setMapData }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);

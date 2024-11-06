const calculateETA = (currentLocation, busLocation) => {
  const distance = calculateDistance(currentLocation, busLocation); // Distance in meters
  const speed = (40 * 1000) / 3600; // Assume average speed of 40 km/h in meters per second
  const etaInSeconds = distance / speed; // ETA in seconds
  const etaInMinutes = Math.round(etaInSeconds / 60); // ETA in minutes
  return etaInMinutes;
};

// limit distance
const calculateDistance = (coord1, coord2) => {
  // Radius of the Earth in meters
  const earthRadius = 6371e3;

  // Convert latitude and longitude from degrees to radians
  const latitude1Radians = (coord1.latitude * Math.PI) / 180;
  const latitude2Radians = (coord2.latitude * Math.PI) / 180;
  const latitudeDifferenceRadians =
    ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const longitudeDifferenceRadians =
    ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(latitudeDifferenceRadians / 2) *
      Math.sin(latitudeDifferenceRadians / 2) +
    Math.cos(latitude1Radians) *
      Math.cos(latitude2Radians) *
      Math.sin(longitudeDifferenceRadians / 2) *
      Math.sin(longitudeDifferenceRadians / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance
  const distance = earthRadius * c;

  return distance;
};

export {calculateDistance, calculateETA};

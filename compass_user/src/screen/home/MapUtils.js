import Config from 'react-native-config';

const calculateETAWithDirectionsAPI = async (
  currentLocation,
  busLocation,
  speed,
) => {
  try {
    // Check if bus speed is 0 and handle accordingly
    if (speed === 0) {
      return 'Bus is not moving';
    }

    const apiKey = Config.GMP_KEY; // Your Google Maps API key
    const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
    const destination = `${busLocation.latitude},${busLocation.longitude}`;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`,
    );

    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const distance = data.routes[0].legs[0].distance.value;

      const speedInMetersPerSecond = (speed * 1000) / 3600;

      const etaInSeconds = distance / speedInMetersPerSecond;

      const etaInMinutes = Math.round(etaInSeconds / 60);

      return etaInMinutes;
    } else {
      throw new Error('Unable to calculate ETA using Directions API');
    }
  } catch (error) {
    console.error(error);
    return null;
  }
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

export {calculateDistance, calculateETAWithDirectionsAPI};

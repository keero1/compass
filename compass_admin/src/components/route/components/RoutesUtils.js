const proxyUrl = "https://cors-anywhere.herokuapp.com/";
export const decodePolyline = (encoded) => {
  let points = [];
  let index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }
  return points;
};

export const getRoute = async (coordinates) => {
  const apiKey = process.env.REACT_APP_MAP_KEY;
  const origin = coordinates[0].join(",");
  const destination = coordinates[coordinates.length - 1].join(",");
  const waypoints = coordinates
    .slice(1, -1)
    .map((coord) => coord.join(","))
    .join("|");

  const response = await fetch(
    proxyUrl +
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${apiKey}`,
  );

  const data = await response.json();

  if (data.routes.length > 0) {
    const points = data.routes[0].overview_polyline.points;
    const decodedPoints = decodePolyline(points);
    return decodedPoints.map((point) => ({
      latitude: point.lat,
      longitude: point.lng,
    }));
  } else {
    throw new Error("No route found");
  }
};

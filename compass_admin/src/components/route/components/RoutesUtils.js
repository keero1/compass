export const getRoute = async (coordinates) => {
  const apiKey = process.env.REACT_APP_MAP_KEY; // Your Google Maps API key

  try {
    const response = await fetch(
      "https://compass-backend-coral.vercel.app/api/getRoute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: coordinates,
          apiKey: apiKey,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return data; // Return the decoded polyline coordinates
    } else {
      throw new Error(data.error || "Error fetching route");
    }
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to get route");
  }
};

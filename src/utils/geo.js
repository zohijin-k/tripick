const EARTH_RADIUS_METERS = 6371000;

const toRadians = (value) => (value * Math.PI) / 180;

export const calculateDistanceMeters = (from, to) => {
  const latDiff = toRadians(to.lat - from.lat);
  const lngDiff = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const haversine =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(lngDiff / 2) *
      Math.sin(lngDiff / 2);

  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_METERS * arc;
};

export const canAutoCheckIn = (currentPosition, destination, threshold = 50) =>
  calculateDistanceMeters(currentPosition, destination) <= threshold;

export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 0,
      },
    );
  });

import type { Spot } from '../types/course';

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine formula — returns straight-line distance in meters.
 * Returns null when any coordinate is non-finite (missing / NaN / Infinity).
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number | null {
  if (
    !isFinite(lat1) ||
    !isFinite(lng1) ||
    !isFinite(lat2) ||
    !isFinite(lng2)
  ) {
    return null;
  }

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Returns true when the user is within radiusMeters of the target spot.
 * Returns false when spot coordinates are missing.
 */
export function isWithinRadius(
  userLocation: LatLng,
  spot: Pick<Spot, 'lat' | 'lng'>,
  radiusMeters = 50,
): boolean {
  if (spot.lat == null || spot.lng == null) return false;
  const dist = calculateDistanceMeters(
    userLocation.lat,
    userLocation.lng,
    spot.lat,
    spot.lng,
  );
  return dist !== null && dist <= radiusMeters;
}

/** Human-readable distance string: "23m" or "1.2km" */
export function formatDistanceM(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

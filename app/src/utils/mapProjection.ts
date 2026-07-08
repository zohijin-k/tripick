import type { Spot } from '../types/course';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
}

export interface MapLocationPoint {
  lat: number;
  lng: number;
  x: number;
  y: number;
}

export interface NormalizedMapData {
  spotPoints: MapPoint[];
  userPoint: MapLocationPoint | null;
}

interface LocationLike {
  lat: number;
  lng: number;
}

const MIN_PADDING = 0.003;
const EDGE_MIN = 6;
const EDGE_MAX = 94;

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function hasValidCoordinates(
  point: Pick<Spot, 'lat' | 'lng'> | LocationLike | null | undefined,
): point is LocationLike {
  return !!point && isFiniteCoordinate(point.lat) && isFiniteCoordinate(point.lng);
}

export function normalizeCoordinates(
  spots: Spot[],
  userLocation?: LocationLike | null,
): NormalizedMapData {
  const spotPointsSource = spots.filter((spot): spot is Spot & LocationLike => hasValidCoordinates(spot));
  const projectionSeed = hasValidCoordinates(userLocation)
    ? [...spotPointsSource, userLocation]
    : spotPointsSource;

  if (projectionSeed.length === 0) {
    return { spotPoints: [], userPoint: null };
  }

  const lats = projectionSeed.map((point) => point.lat);
  const lngs = projectionSeed.map((point) => point.lng);
  const rawMinLat = Math.min(...lats);
  const rawMaxLat = Math.max(...lats);
  const rawMinLng = Math.min(...lngs);
  const rawMaxLng = Math.max(...lngs);

  const latSpan = rawMaxLat - rawMinLat;
  const lngSpan = rawMaxLng - rawMinLng;
  const latPad = Math.max(latSpan * 0.35, MIN_PADDING);
  const lngPad = Math.max(lngSpan * 0.35, MIN_PADDING);

  const minLat = rawMinLat - latPad;
  const maxLat = rawMaxLat + latPad;
  const minLng = rawMinLng - lngPad;
  const maxLng = rawMaxLng + lngPad;

  const latRange = maxLat - minLat || MIN_PADDING * 2;
  const lngRange = maxLng - minLng || MIN_PADDING * 2;

  const toPoint = (point: LocationLike) => ({
    x: clamp(((point.lng - minLng) / lngRange) * 100, EDGE_MIN, EDGE_MAX),
    y: clamp(100 - ((point.lat - minLat) / latRange) * 100, EDGE_MIN, EDGE_MAX),
  });

  return {
    spotPoints: spotPointsSource.map((spot) => ({
      id: spot.id,
      lat: spot.lat,
      lng: spot.lng,
      ...toPoint(spot),
    })),
    userPoint: hasValidCoordinates(userLocation)
      ? {
          lat: userLocation.lat,
          lng: userLocation.lng,
          ...toPoint(userLocation),
        }
      : null,
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkInSpot, completeTrace, fetchTraceProgress } from '../api/backendApi';
import type { LatLng } from './distance';

const key = (courseId: string) => `trace_progress_${courseId}`;

/** Load visited spot IDs for a course. Returns [] on error or first use. */
export async function getTraceProgress(courseId: string): Promise<string[]> {
  const serverTrace = await fetchTraceProgress(courseId);
  if (serverTrace) return serverTrace.visitedSpotIds;

  try {
    const raw = await AsyncStorage.getItem(key(courseId));
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/** Persist the current set of visited spot IDs. */
export async function saveTraceProgress(
  courseId: string,
  visitedSpotIds: string[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(key(courseId), JSON.stringify(visitedSpotIds));
  } catch {
    // silently ignore — app still works without persistence
  }
}

/** Remove saved progress so the user can restart the course. */
export async function clearTraceProgress(courseId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(courseId));
  } catch {
    // silently ignore
  }
}

export async function saveSpotCheckIn({
  courseId,
  spotId,
  userLocation,
  isManual,
}: {
  courseId: string;
  spotId: string;
  userLocation?: LatLng | null;
  isManual?: boolean;
}): Promise<string[] | null> {
  const serverTrace = await checkInSpot({
    courseId,
    spotId,
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    isManual,
  });
  if (serverTrace) {
    if (serverTrace.completionRate >= 100) {
      await completeTrace(courseId);
    }
    return serverTrace.visitedSpotIds;
  }
  return null;
}

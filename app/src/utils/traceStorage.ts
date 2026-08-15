import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkInSpot, completeTrace, fetchTraceProgress } from '../api/backendApi';

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

/**
 * 위치 정직성: 원좌표는 기기 밖으로 내보내지 않고,
 * 기기에서 계산한 파생값(목적지까지 거리, 이동 속도)만 서버로 전송한다.
 */
export async function saveSpotCheckIn({
  courseId,
  spotId,
  distanceMeters,
  speedKmh,
  isManual,
}: {
  courseId: string;
  spotId: string;
  distanceMeters?: number;
  speedKmh?: number;
  isManual?: boolean;
}): Promise<string[] | null> {
  const serverTrace = await checkInSpot({
    courseId,
    spotId,
    distanceMeters,
    speedKmh,
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

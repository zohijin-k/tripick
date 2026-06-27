import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (courseId: string) => `trace_progress_${courseId}`;

/** Load visited spot IDs for a course. Returns [] on error or first use. */
export async function getTraceProgress(courseId: string): Promise<string[]> {
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

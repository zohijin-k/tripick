import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Course } from '../types/course';
import mockCourses from '../data/mockCourses';

const USER_COURSES_KEY = 'user_courses';

/** Load all user-created courses. Returns [] on error. */
export async function getUserCourses(): Promise<Course[]> {
  try {
    const raw = await AsyncStorage.getItem(USER_COURSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Course[];
  } catch {
    return [];
  }
}

/**
 * Prepend a course to the user-courses list.
 * If a course with the same id exists, it is replaced.
 * Throws on AsyncStorage failure so the caller can show an error.
 */
export async function saveUserCourse(course: Course): Promise<void> {
  const existing = await getUserCourses();
  const updated = [course, ...existing.filter((c) => c.id !== course.id)];
  try {
    await AsyncStorage.setItem(USER_COURSES_KEY, JSON.stringify(updated));
  } catch {
    throw new Error('코스 저장에 실패했습니다.');
  }
}

/**
 * Find a course by id.
 * Checks mockCourses first (synchronous-fast), then user-created courses.
 */
export async function findCourse(courseId: string): Promise<Course | null> {
  const mock = mockCourses.find((c) => c.id === courseId);
  if (mock) return mock;
  const userCourses = await getUserCourses();
  return userCourses.find((c) => c.id === courseId) ?? null;
}

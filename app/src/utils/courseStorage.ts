import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Course } from '../types/course';
import mockCourses from '../data/mockCourses';
import { createCourse, fetchCourse, fetchMyCourses } from '../api/backendApi';

const USER_COURSES_KEY = 'user_courses';
const COURSE_IMAGES_KEY = 'course_images';

// ─── 코스 대표 사진 (로컬 저장) ────────────────────────────────────────────────
// 서버 DTO에 imageUrl 필드가 없어도 동작하도록, 유저가 고른 사진은
// 기기(AsyncStorage)에 courseId → uri 맵으로 따로 보관한다.

async function getCourseImageMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(COURSE_IMAGES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function saveCourseImage(courseId: string, uri: string): Promise<void> {
  try {
    const map = await getCourseImageMap();
    map[courseId] = uri;
    await AsyncStorage.setItem(COURSE_IMAGES_KEY, JSON.stringify(map));
  } catch {
    // 사진 저장 실패는 코스 저장을 막지 않는다
  }
}

/** 로컬에 보관한 대표 사진을 코스 목록에 다시 입힌다. */
async function withLocalImages(courses: Course[]): Promise<Course[]> {
  const map = await getCourseImageMap();
  return courses.map((c) => (c.imageUrl || !map[c.id] ? c : { ...c, imageUrl: map[c.id] }));
}

// ─── 유저 코스 CRUD ───────────────────────────────────────────────────────────

/** Load all user-created courses. Returns [] on error. */
export async function getUserCourses(): Promise<Course[]> {
  const serverCourses = await fetchMyCourses();
  if (serverCourses) return withLocalImages(serverCourses);

  try {
    const raw = await AsyncStorage.getItem(USER_COURSES_KEY);
    if (!raw) return [];
    return withLocalImages(JSON.parse(raw) as Course[]);
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
  // 대표 사진은 서버 스키마와 무관하게 로컬에 먼저 보관
  if (course.imageUrl) await saveCourseImage(course.id, course.imageUrl);

  // 서버에는 imageUrl을 제외하고 전송 (백엔드 DTO 검증과의 충돌 방지)
  const { imageUrl: _imageUrl, ...serverPayload } = course;
  const serverCourse = await createCourse(serverPayload as Course);
  if (serverCourse) return;

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
  const serverCourse = await fetchCourse(courseId);
  if (serverCourse) {
    const [withImage] = await withLocalImages([serverCourse]);
    return withImage;
  }

  const mock = mockCourses.find((c) => c.id === courseId);
  if (mock) return mock;
  const userCourses = await getUserCourses();
  return userCourses.find((c) => c.id === courseId) ?? null;
}

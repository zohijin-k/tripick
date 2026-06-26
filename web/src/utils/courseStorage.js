import mockCourses from '../data/mockCourses';

const STORAGE_KEY = 'tripick_user_courses';

export function getUserCourses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveUserCourse(course) {
  const existing = getUserCourses();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, course]));
}

export function findCourse(courseId) {
  return (
    mockCourses.find((c) => c.id === courseId) ??
    getUserCourses().find((c) => c.id === courseId) ??
    null
  );
}

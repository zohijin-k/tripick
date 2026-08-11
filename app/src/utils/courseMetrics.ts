import type { Course } from '../types/course';

export const MIN_VERIFIED_PERFORMERS = 5;

export function hasCourseActivity(course: Course): boolean {
  return course.performers > 0;
}

export function isVerifiedCourse(course: Course): boolean {
  return course.performers >= MIN_VERIFIED_PERFORMERS && course.averageRating > 0;
}

export function formatCompletionRate(course: Course): string {
  return hasCourseActivity(course) ? `${course.completionRate}%` : '-';
}

export function formatAverageRating(course: Course): string {
  return course.averageRating > 0 ? course.averageRating.toFixed(1) : '-';
}

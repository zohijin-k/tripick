import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Review } from '../types/course';

const key = (courseId: string) => `reviews_${courseId}`;

/** Return all reviews stored for a course. Returns [] on error. */
export async function getReviewsForCourse(courseId: string): Promise<Review[]> {
  try {
    const raw = await AsyncStorage.getItem(key(courseId));
    if (!raw) return [];
    return JSON.parse(raw) as Review[];
  } catch {
    return [];
  }
}

/** Append a new review for a course. */
export async function saveReview({
  courseId,
  rating,
  comment,
}: {
  courseId: string;
  rating: number;
  comment: string;
}): Promise<void> {
  try {
    const existing = await getReviewsForCourse(courseId);
    const newReview: Review = {
      id: Date.now().toString(),
      courseId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key(courseId), JSON.stringify([...existing, newReview]));
  } catch {
    // silently ignore
  }
}

/** True if at least one review exists for this course. */
export async function hasReviewedCourse(courseId: string): Promise<boolean> {
  const reviews = await getReviewsForCourse(courseId);
  return reviews.length > 0;
}

/** Mean rating across all reviews, or null when there are none. */
export async function getAverageRating(courseId: string): Promise<number | null> {
  const reviews = await getReviewsForCourse(courseId);
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

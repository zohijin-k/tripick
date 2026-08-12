import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Review } from '../types/course';
import { createReview, fetchReviews } from '../api/backendApi';

const key = (courseId: string) => `reviews_${courseId}`;

// 제안서 기준: 완주율 70% 이상 리뷰는 가중치 1, 미만은 1/3로 반영
export const REVIEW_FULL_WEIGHT_COMPLETION = 70;
export const PARTIAL_REVIEW_WEIGHT = 1 / 3;

function weightFor(completionRate?: number): number {
  if (completionRate == null) return 1;
  return completionRate >= REVIEW_FULL_WEIGHT_COMPLETION ? 1 : PARTIAL_REVIEW_WEIGHT;
}

/** Return all reviews stored for a course. Returns [] on error. */
export async function getReviewsForCourse(courseId: string): Promise<Review[]> {
  const serverReviews = await fetchReviews(courseId);
  if (serverReviews) return serverReviews;

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
  completionRate,
}: {
  courseId: string;
  rating: number;
  comment: string;
  /** 리뷰 작성 시점의 완주율(%) — 가중치 산정에 사용 */
  completionRate?: number;
}): Promise<void> {
  const serverReview = await createReview({ courseId, rating, comment });
  if (serverReview) return;

  try {
    const existing = await getReviewsForCourse(courseId);
    const newReview: Review = {
      id: Date.now().toString(),
      courseId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      completionRate,
      weight: weightFor(completionRate),
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

/**
 * Weighted mean rating across all reviews, or null when there are none.
 * 완주 리뷰(가중치 1)가 미완주 리뷰(1/3)보다 3배 크게 반영된다.
 */
export async function getAverageRating(courseId: string): Promise<number | null> {
  const reviews = await getReviewsForCourse(courseId);
  if (reviews.length === 0) return null;
  const totalWeight = reviews.reduce((acc, r) => acc + (r.weight ?? 1), 0);
  if (totalWeight === 0) return null;
  const weightedSum = reviews.reduce((acc, r) => acc + r.rating * (r.weight ?? 1), 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

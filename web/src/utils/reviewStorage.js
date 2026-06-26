const STORAGE_KEY = 'tripick_reviews';

export function getAllReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function getReviewsForCourse(courseId) {
  return getAllReviews().filter((r) => r.courseId === courseId);
}

export function hasReviewedCourse(courseId) {
  return getAllReviews().some((r) => r.courseId === courseId);
}

export function saveReview({ courseId, rating, comment }) {
  const review = {
    id: `review-${Date.now()}`,
    courseId,
    rating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };
  const existing = getAllReviews();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, review]));
  return review;
}

export function getAverageRating(courseId) {
  const reviews = getReviewsForCourse(courseId);
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
}

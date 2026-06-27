import type { Course, TripickScoreResult } from '../types/course';

export const getPerformerScore = (performers: number): number => {
  const rawScore = (Math.log10(performers + 1) / Math.log10(100)) * 100;
  return Math.min(100, Number(rawScore.toFixed(2)));
};

export const calculateTripickScore = (
  course: Pick<Course, 'completionRate' | 'averageRating' | 'performers'>,
): TripickScoreResult => {
  const performerScore = getPerformerScore(course.performers);
  const ratingScore = (course.averageRating / 5) * 100;
  const score =
    0.5 * course.completionRate + 0.3 * ratingScore + 0.2 * performerScore;
  return {
    performerScore,
    ratingScore: Number(ratingScore.toFixed(2)),
    totalScore: Number(score.toFixed(2)),
  };
};

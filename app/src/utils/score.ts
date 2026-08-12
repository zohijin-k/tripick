import type { Course, Spot, TripickScoreResult } from '../types/course';
import { calculateDistanceMeters } from './distance';

export const getPerformerScore = (performers: number): number => {
  const rawScore = (Math.log10(performers + 1) / Math.log10(100)) * 100;
  return Math.min(100, Number(rawScore.toFixed(2)));
};

// ─── 관광객 분산 가중치 (전주 특화) ──────────────────────────────────────────
// 한옥마을 일극 집중 완화: 한옥마을 핵심권 밖 코스에 +20% 가산.
// 판정은 이름이 아닌 좌표 기반 — 지점 과반이 한옥마을 중심 반경 내면 '핵심권 코스'.
const HANOK_CENTER = { lat: 35.8146, lng: 127.1523 };
const HANOK_CORE_RADIUS_M = 600;
export const DISPERSION_BOOST = 1.2;

export function isHanokCoreCourse(spots?: Spot[]): boolean {
  if (!spots || spots.length === 0) return false;
  const withCoords = spots.filter((s) => s.lat != null && s.lng != null);
  if (withCoords.length === 0) return false;
  const inCore = withCoords.filter((s) => {
    const d = calculateDistanceMeters(HANOK_CENTER.lat, HANOK_CENTER.lng, s.lat!, s.lng!);
    return d !== null && d <= HANOK_CORE_RADIUS_M;
  }).length;
  return inCore / withCoords.length > 0.5;
}

export const calculateTripickScore = (
  course: Pick<Course, 'completionRate' | 'averageRating' | 'performers'> & {
    spots?: Spot[];
  },
): TripickScoreResult => {
  const performerScore = getPerformerScore(course.performers);
  const ratingScore = (course.averageRating / 5) * 100;
  const baseScore =
    0.5 * course.completionRate + 0.3 * ratingScore + 0.2 * performerScore;

  // 한옥마을 핵심권 밖 코스는 +20% 가산 (숨은 코스 발굴·분산 유도)
  const boosted = isHanokCoreCourse(course.spots)
    ? baseScore
    : baseScore * DISPERSION_BOOST;

  return {
    performerScore,
    ratingScore: Number(ratingScore.toFixed(2)),
    totalScore: Number(Math.min(100, boosted).toFixed(2)),
  };
};

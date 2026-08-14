import type { Course, Spot, TripickScoreResult } from '../types/course';
import { calculateDistanceMeters } from './distance';

export const getPerformerScore = (performers: number): number => {
  const rawScore = (Math.log10(performers + 1) / Math.log10(100)) * 100;
  return Math.min(100, Number(rawScore.toFixed(2)));
};

// ─── 숨은 전주 보너스 (전주 특화) ────────────────────────────────────────────
// = 분산 보너스(한옥마을 일극 집중 완화) + 발굴 보너스(검증된 숨은 스팟)
// 한옥 코어 판정은 이름이 아닌 좌표 기반 — 지점 과반이 한옥마을 중심 반경 내면 '핵심권 코스'.
// 숨은 스팟 검증(타인 GPS 체크인 수)은 서버에서 계산되어 course.tripickScore로 내려옴.
const HANOK_CENTER = { lat: 35.8146, lng: 127.1523 };
const HANOK_CORE_RADIUS_M = 600;
export const DISPERSION_BONUS = 0.2; // 한옥마을 코어 외 코스 +20%
export const HIDDEN_SPOT_BONUS = 0.1; // 검증된 숨은 스팟 1개당 +10%
export const HIDDEN_SPOT_BONUS_CAP = 0.2; // 발굴 보너스 상한 +20%

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
    tripickScore?: Pick<TripickScoreResult, 'verifiedHiddenSpotCount'>;
  },
): TripickScoreResult => {
  const performerScore = getPerformerScore(course.performers);
  const ratingScore = (course.averageRating / 5) * 100;
  const baseScore =
    0.5 * course.completionRate + 0.3 * ratingScore + 0.2 * performerScore;

  // 숨은 전주 보너스 = 분산(한옥 코어 외 +20%) + 발굴(검증된 숨은 스팟 1개당 +10%, 상한 +20%)
  const dispersionBonus = isHanokCoreCourse(course.spots) ? 0 : DISPERSION_BONUS;
  const verifiedHiddenSpotCount = course.tripickScore?.verifiedHiddenSpotCount ?? 0;
  const discoveryBonus = Math.min(
    HIDDEN_SPOT_BONUS_CAP,
    verifiedHiddenSpotCount * HIDDEN_SPOT_BONUS,
  );
  const hiddenBonus = Number((dispersionBonus + discoveryBonus).toFixed(2));

  return {
    performerScore,
    ratingScore: Number(ratingScore.toFixed(2)),
    dispersionBonus,
    discoveryBonus,
    hiddenBonus,
    verifiedHiddenSpotCount,
    totalScore: Number(Math.min(100, baseScore * (1 + hiddenBonus)).toFixed(2)),
  };
};

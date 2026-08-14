export interface Spot {
  id: string;
  name: string;
  category?: string;
  lat?: number;
  lng?: number;
  visited?: boolean;
  address?: string;
  imageUrl?: string;
  contentId?: string;
  /** 유저가 직접 발굴해 추가한 숨은 스팟 (TourAPI 목록 밖) */
  isHidden?: boolean;
}

export interface Course {
  id: string;
  title: string;
  area: string;
  theme: string;
  distance: string;
  /** 코스 대표 사진 (시드 코스: TourAPI 이미지 / 유저 코스: 갤러리에서 선택) */
  imageUrl?: string;
  spotCount: number;
  completionRate: number;
  averageRating: number;
  performers: number;
  spots: Spot[];
  transport?: string;
  recommendationReasons?: string[];
  distanceMeters?: number;
  preferenceBonus?: number;
  /** 서버 계산 트리픽 점수 (숨은 스팟 검증 카운트 포함) */
  tripickScore?: TripickScoreResult;
  trustMetrics?: {
    startedCount: number;
    completedCount: number;
    reviewCount: number;
    verifiedReviewCount: number;
    checkInCount: number;
    verifiedCheckInCount: number;
    qualityFieldCount: number;
    filledQualityFieldCount: number;
  };
}

export interface Review {
  id: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
  completionRate?: number;
  weight?: number;
  authorName?: string;
}

export interface TripickScoreResult {
  performerScore: number;
  ratingScore: number;
  totalScore: number;
  /** 분산 보너스 (한옥마을 코어 외 코스 +0.2) */
  dispersionBonus?: number;
  /** 발굴 보너스 (검증된 숨은 스팟 1개당 +0.1, 상한 +0.2) */
  discoveryBonus?: number;
  /** 숨은 전주 보너스 = 분산 + 발굴 */
  hiddenBonus?: number;
  /** 타인 GPS 체크인으로 검증된 숨은 스팟 수 */
  verifiedHiddenSpotCount?: number;
}

export interface TrustScoreItem {
  label: string;
  value: number;
  max: number;
  description: string;
}

export interface TrustScoreResult {
  score: number;
  items: TrustScoreItem[];
}

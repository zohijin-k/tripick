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

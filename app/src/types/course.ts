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

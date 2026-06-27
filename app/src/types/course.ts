export interface Spot {
  id: string;
  name: string;
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
}

export interface Review {
  id: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
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

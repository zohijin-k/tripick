import type { Course, Review, TrustScoreResult } from '../types/course';

function ratio(value: number, total: number): number {
  return total > 0 ? value / total : 0;
}

export function calculateTrustScore(course: Course, reviews: Review[] = []): TrustScoreResult {
  const spots = course.spots ?? [];
  const metrics = course.trustMetrics;

  // A completed session is counted only after every course spot was GPS checked.
  const startedCount = metrics?.startedCount ?? course.performers ?? 0;
  const completedCount = metrics?.completedCount ?? Math.round(startedCount * ((course.completionRate ?? 0) / 100));
  const completionRate = ratio(completedCount, startedCount);
  const completionVal = Math.round(completionRate * 35);

  // Trust is about evidence quality, not whether the rating itself is high.
  const reviewCount = metrics?.reviewCount ?? reviews.length;
  const verifiedReviews = metrics?.verifiedReviewCount ?? reviews.filter((review) => (review.completionRate ?? 0) >= 100).length;
  const verifiedRatioPoints = ratio(verifiedReviews, reviewCount) * 10;
  const volumePoints = Math.min(Math.log10(reviewCount + 1) / Math.log10(31), 1) * 10;
  const ratings = reviews.map((review) => review.rating);
  const average = ratings.length > 0 ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0;
  const variance = ratings.length > 1
    ? ratings.reduce((sum, value) => sum + (value - average) ** 2, 0) / ratings.length
    : 4;
  const consistencyPoints = ratings.length > 1 ? Math.max(0, 5 * (1 - Math.sqrt(variance) / 2)) : 0;
  const reviewVal = Math.round(verifiedRatioPoints + volumePoints + consistencyPoints);

  const performerVal = Math.round(Math.min(Math.log10(startedCount + 1) / Math.log10(101), 1) * 20);

  const checkInCount = metrics?.checkInCount ?? 0;
  const verifiedCheckIns = metrics?.verifiedCheckInCount ?? 0;
  const gpsVal = metrics
    ? Math.round(ratio(verifiedCheckIns, checkInCount) * 10)
    : Math.round(ratio(spots.filter((spot) => spot.lat != null && spot.lng != null).length, spots.length) * 10);

  const qualityFields = metrics?.qualityFieldCount ?? spots.length * 5;
  const filledQualityFields = metrics?.filledQualityFieldCount ?? spots.reduce((sum, spot) => sum + [
    spot.lat != null && spot.lng != null,
    Boolean(spot.address),
    Boolean(spot.imageUrl),
    Boolean(spot.contentId),
    Boolean(spot.category),
  ].filter(Boolean).length, 0);
  const qualityVal = Math.round(ratio(filledQualityFields, qualityFields) * 10);

  return {
    score: Math.min(100, completionVal + reviewVal + performerVal + gpsVal + qualityVal),
    items: [
      {
        label: '완주 검증',
        value: completionVal,
        max: 35,
        description: `${startedCount}회 시작 중 ${completedCount}회 GPS 완주`,
      },
      {
        label: '리뷰 신뢰도',
        value: reviewVal,
        max: 25,
        description: `${reviewCount}개 리뷰 중 GPS 완주 리뷰 ${verifiedReviews}개`,
      },
      {
        label: '수행자 수',
        value: performerVal,
        max: 20,
        description: `코스를 시작한 고유 수행자 ${startedCount}명`,
      },
      {
        label: 'GPS 검증',
        value: gpsVal,
        max: 10,
        description: metrics ? `50m 이내 자동 체크인 ${verifiedCheckIns}/${checkInCount}건` : '실제 체크인 데이터가 없어 좌표 보유율로 임시 계산',
      },
      {
        label: '데이터 품질',
        value: qualityVal,
        max: 10,
        description: `좌표·주소·이미지·TourAPI ID·카테고리 ${filledQualityFields}/${qualityFields}개 충족`,
      },
    ],
  };
}

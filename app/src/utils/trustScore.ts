import type { Course, Review, TrustScoreResult } from '../types/course';

export function calculateTrustScore(
  course: Course,
  reviews: Review[] = [],
): TrustScoreResult {
  const spots = course.spots ?? [];

  // 완주율 (35점 만점)
  const completionVal = Math.round(((course.completionRate ?? 0) / 100) * 35);

  // 리뷰 신뢰도 (25점 만점: 리뷰 수 15 + 별점 10)
  const reviewCount = reviews.length;
  const avgFromReviews =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;
  const effectiveRating = avgFromReviews ?? course.averageRating ?? 0;
  const reviewCountPts = Math.min(reviewCount / 10, 1) * 15;
  const ratingPts = (effectiveRating / 5) * 10;
  const reviewVal = Math.round(reviewCountPts + ratingPts);

  // 수행자 수 (20점 만점, log 스케일 – 100명 기준 만점)
  const performers = course.performers ?? 0;
  const performerVal = Math.round(
    (Math.log10(performers + 1) / Math.log10(100)) * 20,
  );

  // GPS 검증 가능성 (10점 만점)
  const gpsValid = spots.filter((s) => s.lat != null && s.lng != null).length;
  const gpsVal =
    spots.length > 0 ? Math.round((gpsValid / spots.length) * 10) : 0;

  // 관광데이터 품질 (10점 만점)
  const qualityValid = spots.filter(
    (s) => s.imageUrl || s.address || s.contentId,
  ).length;
  const qualityVal =
    spots.length > 0 ? Math.round((qualityValid / spots.length) * 10) : 0;

  const total = Math.min(
    100,
    completionVal + reviewVal + performerVal + gpsVal + qualityVal,
  );

  return {
    score: total,
    items: [
      {
        label: '완주율',
        value: completionVal,
        max: 35,
        description: '실제 수행 완료 비율을 반영합니다.',
      },
      {
        label: '리뷰 신뢰도',
        value: reviewVal,
        max: 25,
        description:
          reviewCount > 0
            ? `${reviewCount}개 리뷰 · 평균 ${effectiveRating.toFixed(1)}점`
            : '아직 리뷰가 없습니다.',
      },
      {
        label: '수행자 수',
        value: performerVal,
        max: 20,
        description: `${performers}명이 수행했습니다.`,
      },
      {
        label: 'GPS 검증',
        value: gpsVal,
        max: 10,
        description: `${gpsValid}/${spots.length}개 지점 좌표 확인됨`,
      },
      {
        label: '데이터 품질',
        value: qualityVal,
        max: 10,
        description: '이미지·주소·관광데이터 정보 충실도',
      },
    ],
  };
}

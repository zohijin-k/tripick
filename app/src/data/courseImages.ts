import type { Course } from '../types/course';

/**
 * 시드(예시) 코스 대표 사진.
 * 한국관광공사 TourAPI가 제공하는 공개 이미지(tong.visitkorea.or.kr)를 사용한다.
 * 유저가 직접 만든 코스는 course.imageUrl(갤러리에서 선택)이 우선한다.
 */
const SEED_COURSE_IMAGES: Record<string, string> = {
  // 오목대와 이목대 (야경 산책로의 대표 지점)
  'jeonju-night-walk':
    'https://tong.visitkorea.or.kr/cms/resource/46/3533046_image2_1.jpg',
  // 객사길
  'gaekridan-cafe':
    'https://tong.visitkorea.or.kr/cms/resource/59/3351559_image2_1.jpg',
  // 서학동사진미술관
  'seohak-art':
    'https://tong.visitkorea.or.kr/cms/resource/98/3536998_image2_1.jpg',
  // 남천교 청연루
  'hanok-bypass':
    'https://tong.visitkorea.or.kr/cms/resource/64/3422464_image2_1.jpg',
  // 전주 남부시장
  'nambu-market-youth':
    'https://tong.visitkorea.or.kr/cms/resource/35/3428535_image2_1.jpg',
  // 아중호수 (덕진공원 이미지가 TourAPI에 없어 임시 — 추후 교체)
  'deokjin-lake':
    'https://tong.visitkorea.or.kr/cms/resource/54/3442254_image2_1.jpg',
};

/** 서버 시드 데이터는 id가 다를 수 있어 제목 키워드로도 매칭한다. */
const TITLE_FALLBACKS: Array<[keyword: string, url: string]> = [
  ['야경', SEED_COURSE_IMAGES['jeonju-night-walk']],
  ['객리단길', SEED_COURSE_IMAGES['gaekridan-cafe']],
  ['서학동', SEED_COURSE_IMAGES['seohak-art']],
  ['한옥마을', SEED_COURSE_IMAGES['hanok-bypass']],
  ['남부시장', SEED_COURSE_IMAGES['nambu-market-youth']],
  ['덕진공원', SEED_COURSE_IMAGES['deokjin-lake']],
];

/** 코스의 대표 사진 URL을 구한다. 없으면 undefined (→ 컬러 fallback 헤더). */
export function getCourseImage(
  course: Pick<Course, 'id' | 'title'> & { imageUrl?: string },
): string | undefined {
  if (course.imageUrl) return course.imageUrl;
  if (SEED_COURSE_IMAGES[course.id]) return SEED_COURSE_IMAGES[course.id];
  const hit = TITLE_FALLBACKS.find(([keyword]) => course.title.includes(keyword));
  return hit?.[1];
}

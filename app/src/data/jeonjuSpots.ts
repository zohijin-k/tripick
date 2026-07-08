import type { Spot } from '../types/course';

/**
 * TourAPI 키가 없거나 요청이 실패했을 때 사용하는 전주 관광지 fallback 데이터.
 * category 값은 src/api/tourApi.ts의 mapCategory()가 반환하는 값과 동일한
 * 어휘를 사용해 SmartCourseScreen의 스타일 매칭이 API/mock 양쪽에서 동작하도록 맞춘다.
 */
const jeonjuSpots: Spot[] = [
  { id: 'js-001', name: '전동성당', category: '역사', lat: 35.8142, lng: 127.148, address: '전북 전주시 완산구 태조로 51' },
  { id: 'js-002', name: '경기전', category: '역사', lat: 35.8151, lng: 127.1494, address: '전북 전주시 완산구 태조로 44' },
  { id: 'js-003', name: '풍남문', category: '역사', lat: 35.8134, lng: 127.1467, address: '전북 전주시 완산구 풍남문3길 1' },
  { id: 'js-004', name: '전주향교', category: '역사', lat: 35.8157, lng: 127.1511, address: '전북 전주시 완산구 향교길 139' },
  { id: 'js-005', name: '오목대', category: '야경', lat: 35.8114, lng: 127.1551, address: '전북 전주시 완산구 기린대로 55' },
  { id: 'js-006', name: '한벽당', category: '야경', lat: 35.8126, lng: 127.1589, address: '전북 전주시 완산구 기린대로 2' },
  { id: 'js-007', name: '남천교 야경 포인트', category: '야경', lat: 35.8098, lng: 127.1559, address: '전북 전주시 완산구 매곡로 24' },
  { id: 'js-008', name: '청연루 전망대', category: '야경', lat: 35.8117, lng: 127.1567, address: '전북 전주시 완산구 교동' },
  { id: 'js-009', name: '자만벽화마을', category: '로컬', lat: 35.8106, lng: 127.1582, address: '전북 전주시 완산구 교동' },
  { id: 'js-010', name: '전주 부채문화관', category: '로컬', lat: 35.8129, lng: 127.152, address: '전북 전주시 완산구 한지길 30' },
  { id: 'js-011', name: '전주 공예품전시관', category: '로컬', lat: 35.8151, lng: 127.1526, address: '전북 전주시 완산구 태조로 30' },
  { id: 'js-012', name: '서학동예술마을', category: '예술', lat: 35.8078, lng: 127.1549, address: '전북 전주시 완산구 서학로 16' },
  { id: 'js-013', name: '독립서점 나비장', category: '예술', lat: 35.8072, lng: 127.1562, address: '전북 전주시 완산구 서학로 20' },
  { id: 'js-014', name: '전주 영화의거리', category: '예술', lat: 35.8183, lng: 127.1447, address: '전북 전주시 완산구 고사동' },
  { id: 'js-015', name: '최명희문학관', category: '예술', lat: 35.8144, lng: 127.1537, address: '전북 전주시 완산구 최명희길 29' },
  { id: 'js-016', name: '객리단길 카페거리', category: '카페', lat: 35.8194, lng: 127.1458, address: '전북 전주시 완산구 충경로 46' },
  { id: 'js-017', name: '로스터리 카페 거리', category: '카페', lat: 35.8194, lng: 127.1458, address: '전북 전주시 완산구 고사동' },
  { id: 'js-018', name: '남부시장 청년몰', category: '시장', lat: 35.8096, lng: 127.1438, address: '전북 전주시 완산구 풍남문2길 39' },
  { id: 'js-019', name: '남부시장 야시장', category: '시장', lat: 35.8102, lng: 127.1431, address: '전북 전주시 완산구 풍남문2길 39' },
  { id: 'js-020', name: '전주 막걸리골목', category: '음식', lat: 35.8168, lng: 127.1449, address: '전북 전주시 완산구 삼천동' },
  { id: 'js-021', name: '삼백집 먹거리길', category: '음식', lat: 35.8175, lng: 127.1441, address: '전북 전주시 완산구 전주객사3길' },
  { id: 'js-022', name: '덕진공원', category: '자연', lat: 35.8465, lng: 127.1284, address: '전북 전주시 덕진구 권삼득로 390' },
  { id: 'js-023', name: '전주천 산책로', category: '자연', lat: 35.8122, lng: 127.1515, address: '전북 전주시 완산구 교동' },
  { id: 'js-024', name: '완산칠봉 전망대', category: '자연', lat: 35.8032, lng: 127.1462, address: '전북 전주시 완산구 곤지산길' },
];

export default jeonjuSpots;

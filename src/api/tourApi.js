// TourAPI v2 (KorService1) — 한국관광공사 관광정보 API
// https://www.data.go.kr/data/15101578/openapi.do
//
// 주의: .env에는 반드시 "디코딩 키"를 사용할 것.
//       인코딩 키(%)를 넣으면 encodeURIComponent로 이중 인코딩되어 인증 실패.

// 개발 환경에서는 Vite 프록시(/tourapi)를 통해 CORS 문제를 우회하고,
// 프로덕션 빌드에서는 TourAPI가 지원하는 CORS 헤더로 직접 호출.
const BASE = import.meta.env.DEV
  ? '/tourapi'
  : 'https://apis.data.go.kr/B551011/KorService1';

// TourAPI cat1/cat2 → TRIPICK 카테고리
function mapCategory(cat1, cat2) {
  if (cat1 === 'A01') return '자연';
  if (cat1 === 'A02') {
    if (cat2 === 'A0201') return '역사';
    if (cat2 === 'A0205' || cat2 === 'A0206') return '예술';
    return '로컬';
  }
  if (cat1 === 'A03') return '자연';
  if (cat1 === 'A04') return '시장';
  if (cat1 === 'A05') return '음식';
  return '관광지';
}

function normalizeSpot(item) {
  return {
    id: `tour-${item.contentid}`,
    name: item.title?.trim() ?? '',
    category: mapCategory(item.cat1, item.cat2),
    lat: parseFloat(item.mapy),
    lng: parseFloat(item.mapx),
    address: item.addr1?.trim() ?? '',
    imageUrl: item.firstimage || item.firstimage2 || '',
    contentId: String(item.contentid),
  };
}

async function fetchAreaList(apiKey, contentTypeId) {
  const params = new URLSearchParams({
    numOfRows: '100',
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'TRIPICK',
    _type: 'json',
    areaCode: '37',     // 전라북도
    sigunguCode: '11',  // 전주시
    contentTypeId,
  });

  // serviceKey는 URLSearchParams 외부에서 encodeURIComponent로 처리
  // (디코딩 키를 1회만 인코딩)
  const url = `${BASE}/areaBasedList1?serviceKey=${encodeURIComponent(apiKey)}&${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`TourAPI HTTP ${res.status}`);
  }

  const json = await res.json();

  const resultCode = json?.response?.header?.resultCode;
  if (resultCode && resultCode !== '0000') {
    throw new Error(`TourAPI error ${resultCode}: ${json?.response?.header?.resultMsg}`);
  }

  const items = json?.response?.body?.items?.item;
  if (!items) return [];
  // 단일 결과는 배열이 아닌 객체로 올 수 있음
  return Array.isArray(items) ? items : [items];
}

/**
 * 전주시 관광지 목록을 TourAPI에서 조회합니다.
 *
 * @returns {Promise<Array|null>}
 *   - Array: 정규화된 spot 배열 (성공)
 *   - null: API 키 미설정 (호출부에서 fallback 처리)
 *   - throws: API 요청 실패 (호출부에서 fallback 처리)
 */
export async function fetchJeonjuSpots() {
  const apiKey = import.meta.env.VITE_TOUR_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return null; // 키 미설정 → fallback 신호
  }

  // 관광지(12) + 문화시설(14) 동시 조회
  // allSettled: 한쪽이 실패해도 다른 쪽 결과를 유지
  const results = await Promise.allSettled([
    fetchAreaList(apiKey, '12'),
    fetchAreaList(apiKey, '14'),
  ]);

  const allItems = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  if (allItems.length === 0) {
    // 모든 요청이 실패한 경우 첫 번째 에러를 전파
    const firstError = results.find((r) => r.status === 'rejected');
    throw firstError ? firstError.reason : new Error('TourAPI returned no items');
  }

  // contentid 기준 중복 제거 + 좌표 없는 항목 필터링 + 정규화
  const seen = new Set();
  return allItems
    .filter((item) => {
      if (!item.title || !item.mapy || !item.mapx) return false;
      if (seen.has(item.contentid)) return false;
      seen.add(item.contentid);
      return true;
    })
    .map(normalizeSpot)
    .filter((spot) => !Number.isNaN(spot.lat) && !Number.isNaN(spot.lng));
}

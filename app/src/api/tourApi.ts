import type { Spot } from '../types/course';

// 한국관광공사 TourAPI v2 (KorService1) — web/src/api/tourApi.js와 동일한 계약을 따른다.
// https://www.data.go.kr/data/15101578/openapi.do
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';
const AREA_CODE = '37'; // 전라북도
const SIGUNGU_CODE = '11'; // 전주시
const CONTENT_TYPE_IDS = ['12', '14'] as const; // 12: 관광지, 14: 문화시설

interface TourApiRawItem {
  contentid: string;
  title?: string;
  cat1?: string;
  cat2?: string;
  mapx?: string;
  mapy?: string;
  addr1?: string;
  firstimage?: string;
  firstimage2?: string;
}

function mapCategory(cat1?: string, cat2?: string): string {
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

/**
 * TourAPI 원본 item을 앱 내부 Spot 형태로 정규화한다.
 * 좌표(mapx/mapy)가 없거나 숫자로 변환할 수 없으면 null을 반환해 제외 처리한다.
 */
export function normalizeTourSpot(item: TourApiRawItem): Spot | null {
  if (!item?.title) return null;

  const lat = parseFloat(item.mapy ?? '');
  const lng = parseFloat(item.mapx ?? '');
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return {
    id: `tour-${item.contentid}`,
    name: item.title.trim(),
    category: mapCategory(item.cat1, item.cat2),
    lat,
    lng,
    address: item.addr1?.trim() || undefined,
    imageUrl: item.firstimage || item.firstimage2 || undefined,
    contentId: String(item.contentid),
  };
}

async function fetchAreaList(apiKey: string, contentTypeId: string): Promise<TourApiRawItem[]> {
  // RN(Expo)에 내장된 URLSearchParams 폴리필 사용 — serviceKey는 이미 인코딩된 값이
  // 들어올 수 있으므로 이중 인코딩을 피하기 위해 별도로 붙인다.
  const params = new URLSearchParams({
    numOfRows: '100',
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'TRIPICK',
    _type: 'json',
    areaCode: AREA_CODE,
    sigunguCode: SIGUNGU_CODE,
    contentTypeId,
  });

  const url = `${BASE_URL}/areaBasedList1?serviceKey=${encodeURIComponent(apiKey)}&${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TourAPI HTTP ${response.status}`);
  }

  const json = await response.json();
  const header = json?.response?.header;
  if (!header || header.resultCode !== '0000') {
    throw new Error(`TourAPI error ${header?.resultCode ?? 'unknown'}: ${header?.resultMsg ?? '알 수 없는 오류'}`);
  }

  const items = json?.response?.body?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

/**
 * 전주(완산구/덕진구) 관광지·문화시설 데이터를 TourAPI에서 조회한다.
 *
 * - EXPO_PUBLIC_TOUR_API_KEY가 없으면 null 반환 (mock으로 fallback해야 함을 의미)
 * - 네트워크/인증/CORS 오류 등 어떤 예외가 발생해도 앱이 죽지 않도록 null 반환
 * - 요청은 성공했지만 결과가 없으면 빈 배열([]) 반환
 */
export async function fetchJeonjuSpots(): Promise<Spot[] | null> {
  const apiKey = process.env.EXPO_PUBLIC_TOUR_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const results = await Promise.allSettled(
      CONTENT_TYPE_IDS.map((contentTypeId) => fetchAreaList(apiKey, contentTypeId)),
    );

    const allItems = results
      .filter((r): r is PromiseFulfilledResult<TourApiRawItem[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    const seen = new Set<string>();
    const spots: Spot[] = [];
    for (const item of allItems) {
      if (!item.contentid || seen.has(item.contentid)) continue;
      seen.add(item.contentid);
      const spot = normalizeTourSpot(item);
      if (spot) spots.push(spot);
    }

    return spots;
  } catch {
    return null;
  }
}

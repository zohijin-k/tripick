// NestJS backend(TourAPI 프록시)와 통신하는 모듈.
// 앱은 TourAPI를 직접 호출하지 않으며, 이 모듈을 통해서만 backend API를 호출한다.

export interface BackendTourSpot {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  imageUrl: string | null;
  contentId: string;
  contentTypeId: string;
}

interface JeonjuSpotsResponse {
  source: string;
  count: number;
  spots: BackendTourSpot[];
}

/**
 * backend의 /tour/spots/jeonju를 호출해 전주 관광지 데이터를 가져온다.
 *
 * - EXPO_PUBLIC_API_BASE_URL이 없으면 null 반환 (mock으로 fallback해야 함을 의미)
 * - HTTP 오류, 네트워크 오류, 잘못된 응답 형식 등 어떤 예외가 발생해도
 *   앱이 죽지 않도록 항상 null 또는 배열을 반환한다.
 */
export async function fetchJeonjuSpots(): Promise<BackendTourSpot[] | null> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl || baseUrl.trim() === '') {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/tour/spots/jeonju`);
    if (!response.ok) {
      return null;
    }

    const json: JeonjuSpotsResponse = await response.json();
    if (!Array.isArray(json?.spots)) {
      return null;
    }

    return json.spots;
  } catch {
    return null;
  }
}

import { useEffect, useState } from 'react';
import type { Spot } from '../types/course';
import { fetchJeonjuSpots, type BackendTourSpot } from '../api/backendApi';
import jeonjuSpots from '../data/jeonjuSpots';

export type TourSpotsSource = 'backend' | 'mock';

export interface UseTourSpotsResult {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  source: TourSpotsSource;
}

function toSpot(item: BackendTourSpot): Spot {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    lat: item.lat,
    lng: item.lng,
    address: item.address || undefined,
    imageUrl: item.imageUrl || undefined,
    contentId: item.contentId,
  };
}

/**
 * NestJS backend(TourAPI 프록시)에서 전주 관광지 데이터를 불러온다.
 * backend URL이 없거나 요청이 실패하면 jeonjuSpots.ts의 mock 데이터로 자동 fallback한다.
 */
export function useTourSpots(): UseTourSpotsResult {
  const [spots, setSpots] = useState<Spot[]>(jeonjuSpots);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<TourSpotsSource>('mock');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const backendSpots = await fetchJeonjuSpots();
        if (cancelled) return;

        if (backendSpots && backendSpots.length > 0) {
          setSpots(backendSpots.map(toSpot));
          setSource('backend');
          setError(null);
        } else {
          setSpots(jeonjuSpots);
          setSource('mock');
        }
      } catch (err) {
        if (cancelled) return;
        setSpots(jeonjuSpots);
        setSource('mock');
        setError(err instanceof Error ? err.message : 'Backend 요청 중 오류가 발생했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { spots, loading, error, source };
}

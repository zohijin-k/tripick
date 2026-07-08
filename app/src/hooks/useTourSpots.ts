import { useEffect, useState } from 'react';
import type { Spot } from '../types/course';
import { fetchJeonjuSpots } from '../api/tourApi';
import jeonjuSpots from '../data/jeonjuSpots';

export type TourSpotsSource = 'api' | 'mock';

export interface UseTourSpotsResult {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  source: TourSpotsSource;
}

/**
 * TourAPI 관광지 데이터를 불러온다. 키가 없거나 요청이 실패하면
 * jeonjuSpots.ts의 mock 데이터로 자동 fallback한다.
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
        const apiSpots = await fetchJeonjuSpots();
        if (cancelled) return;

        if (apiSpots && apiSpots.length > 0) {
          setSpots(apiSpots);
          setSource('api');
          setError(null);
        } else {
          setSpots(jeonjuSpots);
          setSource('mock');
        }
      } catch (err) {
        if (cancelled) return;
        setSpots(jeonjuSpots);
        setSource('mock');
        setError(err instanceof Error ? err.message : 'TourAPI 요청 중 오류가 발생했습니다.');
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

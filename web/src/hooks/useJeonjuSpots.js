import { useEffect, useState } from 'react';
import { fetchJeonjuSpots } from '../api/tourApi';
import jeonjuSpots from '../data/jeonjuSpots';

/**
 * 전주 관광지 목록을 반환하는 훅.
 * TourAPI 호출 성공 시 실시간 데이터를, 실패 또는 키 미설정 시 mock fallback을 사용.
 *
 * @returns {{ spots: Array, loading: boolean, source: 'api'|'mock'|'loading' }}
 */
export function useJeonjuSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    fetchJeonjuSpots()
      .then((apiSpots) => {
        if (cancelled) return;

        if (Array.isArray(apiSpots) && apiSpots.length > 0) {
          setSpots(apiSpots);
          setSource('api');
        } else {
          // null (키 없음) 또는 빈 배열 → mock fallback
          setSpots(jeonjuSpots);
          setSource('mock');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[TourAPI] Falling back to mock data:', err.message);
        setSpots(jeonjuSpots);
        setSource('mock');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { spots, loading, source };
}

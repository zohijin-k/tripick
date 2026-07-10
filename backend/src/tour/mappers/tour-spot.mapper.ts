import type { TourApiRawItem, TourSpot } from '../interfaces/tour-spot.interface';

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
 * TourAPI 원본 item을 TourSpot으로 정규화한다.
 * 좌표(mapx/mapy)가 없거나 숫자로 변환할 수 없으면 null을 반환해 제외 처리한다.
 */
export function normalizeTourSpot(item: TourApiRawItem): TourSpot | null {
  if (!item?.contentid || !item.title) return null;

  const lat = parseFloat(item.mapy ?? '');
  const lng = parseFloat(item.mapx ?? '');
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return {
    id: String(item.contentid),
    name: item.title.trim(),
    category: mapCategory(item.cat1, item.cat2),
    lat,
    lng,
    address: item.addr1?.trim() ?? '',
    imageUrl: item.firstimage || item.firstimage2 || null,
    contentId: String(item.contentid),
    contentTypeId: item.contenttypeid ? String(item.contenttypeid) : '',
  };
}

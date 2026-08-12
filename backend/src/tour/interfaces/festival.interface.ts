/** 앱에 내려주는 전주 축제·행사 정보 */
export interface JeonjuFestival {
  id: string;
  title: string;
  /** YYYYMMDD */
  startDate: string;
  /** YYYYMMDD */
  endDate: string;
  address: string;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
  /** 오늘 기준 진행 중 여부 */
  isOngoing: boolean;
}

/** TourAPI searchFestival2 원본 item */
export interface TourApiFestivalRawItem {
  contentid: string;
  title?: string;
  eventstartdate?: string;
  eventenddate?: string;
  addr1?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx?: string;
  mapy?: string;
}

export interface TourSpot {
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

export interface TourApiRawItem {
  contentid: string;
  contenttypeid?: string;
  title?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  mapx?: string;
  mapy?: string;
  addr1?: string;
  firstimage?: string;
  firstimage2?: string;
}

export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item?: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_CONTENT_TYPE_IDS,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  JEONJU_AREA_CODE,
  JEONJU_SIGUNGU_CODE,
} from '../config/jeonju.constants';
import { GetJeonjuSpotsQueryDto } from './dto/get-jeonju-spots-query.dto';
import type { TourApiRawItem, TourApiResponse, TourSpot } from './interfaces/tour-spot.interface';
import type { JeonjuFestival, TourApiFestivalRawItem } from './interfaces/festival.interface';
import { normalizeTourSpot } from './mappers/tour-spot.mapper';

export interface JeonjuSpotsResult {
  source: 'tourapi';
  count: number;
  spots: TourSpot[];
}

export interface JeonjuFestivalsResult {
  source: 'tourapi';
  count: number;
  festivals: JeonjuFestival[];
}

/** TourAPI 키 미설정 또는 외부 API 호출 실패를 나타내는 에러. 컨트롤러에서 503으로 변환한다. */
export class TourApiUnavailableError extends Error {}

function formatYyyymmdd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

@Injectable()
export class TourService {
  private readonly logger = new Logger(TourService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getJeonjuSpots(query: GetJeonjuSpotsQueryDto): Promise<JeonjuSpotsResult> {
    const apiKey = this.configService.get<string>('tourApi.key');
    if (!apiKey) {
      throw new TourApiUnavailableError('TOUR_API_KEY가 설정되지 않았습니다.');
    }

    const contentTypeIds = query.contentTypes
      ? query.contentTypes.split(',').map((v) => v.trim()).filter(Boolean)
      : DEFAULT_CONTENT_TYPE_IDS;
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    const results = await Promise.allSettled(
      contentTypeIds.map((contentTypeId) => this.fetchAreaList(apiKey, contentTypeId, page, pageSize)),
    );

    const fulfilled = results.filter(
      (r): r is PromiseFulfilledResult<TourApiRawItem[]> => r.status === 'fulfilled',
    );

    if (fulfilled.length === 0) {
      const firstRejected = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
      const reason = firstRejected?.reason instanceof Error ? firstRejected.reason.message : 'unknown error';
      this.logger.error(`TourAPI 조회 실패: ${reason}`);
      throw new TourApiUnavailableError('TourAPI 조회에 실패했습니다.');
    }

    const allItems = fulfilled.flatMap((r) => r.value);
    const seen = new Set<string>();
    const spots: TourSpot[] = [];
    for (const item of allItems) {
      if (!item.contentid || seen.has(item.contentid)) continue;
      seen.add(item.contentid);
      const spot = normalizeTourSpot(item);
      if (spot) spots.push(spot);
    }

    return { source: 'tourapi', count: spots.length, spots };
  }

  /**
   * 전주에서 진행 중이거나 예정인 축제·행사 조회 (TourAPI searchFestival2).
   * 최근 60일 내 시작한 행사까지 조회한 뒤, 아직 끝나지 않은 것만 남긴다.
   */
  async getJeonjuFestivals(): Promise<JeonjuFestivalsResult> {
    const apiKey = this.configService.get<string>('tourApi.key');
    if (!apiKey) {
      throw new TourApiUnavailableError('TOUR_API_KEY가 설정되지 않았습니다.');
    }

    const baseUrl = this.configService.get<string>('tourApi.baseUrl');
    const today = formatYyyymmdd(new Date());
    const from = formatYyyymmdd(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));

    const params = {
      numOfRows: 50,
      pageNo: 1,
      MobileOS: 'ETC',
      MobileApp: 'TRIPICK',
      _type: 'json',
      areaCode: JEONJU_AREA_CODE,
      sigunguCode: JEONJU_SIGUNGU_CODE,
      eventStartDate: from,
      serviceKey: apiKey,
    };

    let response;
    try {
      response = await firstValueFrom(
        this.httpService.get<TourApiResponse<TourApiFestivalRawItem>>(`${baseUrl}/searchFestival2`, { params }),
      );
    } catch {
      this.logger.error('TourAPI 축제 조회 실패');
      throw new TourApiUnavailableError('TourAPI 축제 조회에 실패했습니다.');
    }

    const header = response.data?.response?.header;
    if (!header || header.resultCode !== '0000') {
      throw new TourApiUnavailableError(`TourAPI 축제 오류 응답 (resultCode=${header?.resultCode ?? 'unknown'})`);
    }

    const rawItems = response.data?.response?.body?.items?.item;
    const items: TourApiFestivalRawItem[] = !rawItems ? [] : Array.isArray(rawItems) ? [rawItems].flat() : [rawItems];

    const festivals: JeonjuFestival[] = items
      .filter((item) => item?.contentid && item.title && item.eventenddate && item.eventenddate >= today)
      .map((item) => {
        const lat = parseFloat(item.mapy ?? '');
        const lng = parseFloat(item.mapx ?? '');
        const startDate = item.eventstartdate ?? '';
        const endDate = item.eventenddate ?? '';
        return {
          id: String(item.contentid),
          title: item.title!.trim(),
          startDate,
          endDate,
          address: item.addr1?.trim() ?? '',
          imageUrl: item.firstimage || item.firstimage2 || null,
          lat: Number.isNaN(lat) ? null : lat,
          lng: Number.isNaN(lng) ? null : lng,
          isOngoing: startDate <= today && today <= endDate,
        };
      })
      .sort((a, b) => {
        // 진행 중 우선, 그다음 시작일 순
        if (a.isOngoing !== b.isOngoing) return a.isOngoing ? -1 : 1;
        return a.startDate.localeCompare(b.startDate);
      })
      .slice(0, 10);

    return { source: 'tourapi', count: festivals.length, festivals };
  }

  private async fetchAreaList(
    apiKey: string,
    contentTypeId: string,
    page: number,
    pageSize: number,
  ): Promise<TourApiRawItem[]> {
    const baseUrl = this.configService.get<string>('tourApi.baseUrl');

    // serviceKey는 axios의 params 직렬화가 자동으로 1회 인코딩한다 — 여기서는
    // "일반 인증키 (Decoding)"을 그대로 전달해야 하며, 이미 인코딩된 키를 넣으면 이중 인코딩으로 실패한다.
    const params = {
      numOfRows: pageSize,
      pageNo: page,
      MobileOS: 'ETC',
      MobileApp: 'TRIPICK',
      _type: 'json',
      areaCode: JEONJU_AREA_CODE,
      sigunguCode: JEONJU_SIGUNGU_CODE,
      contentTypeId,
      serviceKey: apiKey,
    };

    let response;
    try {
      response = await firstValueFrom(
        this.httpService.get<TourApiResponse<TourApiRawItem>>(`${baseUrl}/areaBasedList2`, { params }),
      );
    } catch {
      // 원본 axios 에러는 요청 URL(서비스키 포함)을 담고 있을 수 있으므로 그대로 노출하지 않는다.
      throw new Error(`TourAPI 요청 실패 (contentTypeId=${contentTypeId})`);
    }

    const header = response.data?.response?.header;
    if (!header || header.resultCode !== '0000') {
      throw new Error(`TourAPI 오류 응답 (contentTypeId=${contentTypeId}, resultCode=${header?.resultCode ?? 'unknown'})`);
    }

    const items = response.data?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }
}

import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { GetJeonjuSpotsQueryDto } from './dto/get-jeonju-spots-query.dto';
import { TourApiUnavailableError, TourService } from './tour.service';

@ApiTags('tour')
@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get('spots/jeonju')
  @ApiOperation({ summary: '전주 관광지/문화시설 목록 조회 (TourAPI 프록시)' })
  @ApiQuery({ name: 'contentTypes', required: false, example: '12,14', description: '콤마로 구분된 contentTypeId 목록' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  @ApiOkResponse({
    description: '정상 조회 결과',
    schema: { example: { source: 'tourapi', count: 25, spots: [] } },
  })
  @ApiServiceUnavailableResponse({
    description: 'TourAPI 키 미설정 또는 외부 API 호출 실패',
    schema: { example: { statusCode: 503, message: 'TourAPI 데이터를 가져올 수 없습니다.' } },
  })
  async getJeonjuSpots(@Query() query: GetJeonjuSpotsQueryDto) {
    try {
      return await this.tourService.getJeonjuSpots(query);
    } catch (err) {
      if (err instanceof TourApiUnavailableError) {
        throw new HttpException(
          { message: 'TourAPI 데이터를 가져올 수 없습니다.' },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        { message: '관광지 데이터를 조회하는 중 오류가 발생했습니다.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetJeonjuSpotsQueryDto {
  @ApiPropertyOptional({
    description: '콤마로 구분된 TourAPI contentTypeId 목록 (기본값: 12,14 = 관광지,문화시설)',
    example: '12,14',
  })
  @IsOptional()
  @IsString()
  contentTypes?: string;

  @ApiPropertyOptional({ description: '페이지 번호 (기본값: 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '페이지당 개수 (기본값: 50, 최대 100)', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

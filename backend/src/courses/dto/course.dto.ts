import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SpotDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  contentId?: string;

  /** 유저가 직접 발굴해 추가한 숨은 스팟 (TourAPI 목록 밖) */
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class CreateCourseDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  title!: string;

  @IsString()
  area!: string;

  @IsString()
  theme!: string;

  @IsString()
  distance!: string;

  @IsOptional()
  @IsString()
  transport?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendationReasons?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SpotDto)
  spots!: SpotDto[];
}

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CheckInDto {
  @IsString()
  spotId!: string;

  /**
   * 위치 정직성: 신규 클라이언트는 원좌표 대신 기기에서 계산한
   * 파생값(distanceMeters·speedKmh)만 전송한다. lat/lng는 구버전 APK
   * 하위호환용으로만 받고, 서버는 어떤 경우에도 원좌표를 저장하지 않는다.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceMeters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speedKmh?: number;

  /** @deprecated 구버전 APK 하위호환용 — 저장되지 않음 */
  @IsOptional()
  @IsNumber()
  lat?: number;

  /** @deprecated 구버전 APK 하위호환용 — 저장되지 않음 */
  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsBoolean()
  isManual?: boolean;
}

export class RateCheckInDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}

export class NearbyCourseQueryDto {
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(10000)
  radius?: number;
}

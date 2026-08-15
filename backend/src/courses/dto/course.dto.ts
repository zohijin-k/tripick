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

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

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

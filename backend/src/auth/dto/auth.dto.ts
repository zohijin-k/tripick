import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  nickname!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class DevLoginDto {
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nickname?: string;

  @IsOptional()
  @IsIn(['감성', '역사', '야경', '먹거리', '자연', '로컬'])
  travelStyle?: string;

  @IsOptional()
  @IsIn(['짧은 코스', '반나절', '하루'])
  duration?: string;

  @IsOptional()
  @IsIn(['도보', '대중교통', '자전거'])
  transport?: string;
}

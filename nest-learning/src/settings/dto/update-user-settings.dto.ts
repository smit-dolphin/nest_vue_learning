import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  compactView?: boolean;

  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @IsOptional()
  @IsIn(['SRT', 'VTT'])
  defaultFormat?: 'SRT' | 'VTT';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  autoPunctuation?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  wordLevelTiming?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  autoTranslate?: boolean;

  @IsOptional()
  @IsString()
  translateLanguage?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fontSize?: number;

  @IsOptional()
  @IsString()
  fontColor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  backgroundOpacity?: number;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  outline?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  jobComplete?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  jobFailed?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  weeklyReport?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  productUpdates?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  marketing?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  autoDownload?: boolean;
}

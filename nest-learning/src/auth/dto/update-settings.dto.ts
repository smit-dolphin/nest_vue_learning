import { Type } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UserNotificationPrefsDto {
  @IsOptional()
  @IsBoolean()
  jobComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  jobFailed?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyReport?: boolean;

  @IsOptional()
  @IsBoolean()
  productUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  marketing?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  defaultLang?: string;

  @IsOptional()
  @IsString()
  defaultFormat?: string;

  @IsOptional()
  @IsBoolean()
  autoDownload?: boolean;

  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @IsOptional()
  @IsBoolean()
  compactView?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserNotificationPrefsDto)
  notifications?: UserNotificationPrefsDto;
}
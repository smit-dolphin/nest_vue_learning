import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class uploadAndGenrateVideoDto {
  @IsOptional()
  @IsString()
  leng?: string;

  @IsOptional()
  @IsString()
  formate?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lables?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  autoTranslate?: boolean;

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
  burnVideo?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsString()
  fontColor?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  background?: boolean;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  backgroundOpacity?: number;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  outline?: number;
}

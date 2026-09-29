import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const trimText = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateAdminSettingsDto {
  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Matches(/\S/)
  businessName?: string;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Matches(/\S/)
  phone?: string;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Matches(/\S/)
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Matches(/\S/)
  address?: string;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Matches(/\S/)
  openingHours?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  oilChangeIntervalKm?: number;
}

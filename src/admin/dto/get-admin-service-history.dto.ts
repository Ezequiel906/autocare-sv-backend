import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class GetAdminServiceHistoryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  date?: string;
}

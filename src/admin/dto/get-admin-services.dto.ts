import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetAdminServicesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  active?: 'true' | 'false';
}

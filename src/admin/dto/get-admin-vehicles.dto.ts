import { IsOptional, IsString } from 'class-validator';

export class GetAdminVehiclesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

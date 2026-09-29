import { IsOptional, IsString } from 'class-validator';

export class GetAdminCustomersDto {
  @IsOptional()
  @IsString()
  search?: string;
}

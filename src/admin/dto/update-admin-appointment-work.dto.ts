import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAdminAppointmentWorkDto {
  @IsOptional()
  @IsString()
  technicianNotes?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number | null;

  @IsOptional()
  @IsString()
  observations?: string | null;
}

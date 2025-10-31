import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateLicenseStatusDto {
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  reviewNotes?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;
}

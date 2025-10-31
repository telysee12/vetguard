import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateLicenseApplicationDto {
  @IsInt()
  @IsNotEmpty()
  vetId: number;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsNotEmpty()
  licenseType: string;

  @IsString()
  @IsOptional()
  paymentReceiptUrl?: string;
}

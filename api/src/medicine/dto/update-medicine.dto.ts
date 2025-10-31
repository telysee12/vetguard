import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicineDto } from './create-medicine.dto';
import { IsInt, Min, IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {
  @IsOptional()
  @IsInt()
  @Min(0)
  totalStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockIn?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockOut?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsInt()
  veterinarianId?: number;
}

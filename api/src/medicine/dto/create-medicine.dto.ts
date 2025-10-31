import { IsString, IsInt, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  totalStock: number;

  @IsInt()
  @Min(0)
  currentStock: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockIn?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockOut?: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsInt()
  veterinarianId: number;
}

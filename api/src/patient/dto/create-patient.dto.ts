import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  animalName!: string;

  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @IsString()
  @IsNotEmpty()
  ownerPhone!: string;

  @IsString()
  @IsOptional()
  ownerEmail: string;

  @IsString()
  @IsOptional()
  ownerIdNumber?: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsString()
  @IsOptional()
  cell?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  previousConditions?: string;

  @IsInt()
  @IsNotEmpty()
  veterinarianId!: number;
}

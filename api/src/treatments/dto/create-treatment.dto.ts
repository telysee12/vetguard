import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateTreatmentDto {
  @IsNumber()
  patientId: number;

  @IsNumber()
  veterinarianId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];
}

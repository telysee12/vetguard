import { IsString, IsOptional } from 'class-validator';

export class UpdatePassportPhotoDto {
  @IsOptional()
  @IsString()
  passportPhotoUrl?: string;
}

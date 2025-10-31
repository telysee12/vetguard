import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsDateString,
  IsEnum,
  Matches,
  Length,
} from 'class-validator';

export enum RegisterRole {
  BASIC_VET = 'BASIC_VET',
  SECTOR_VET = 'SECTOR_VET',
  ADMIN = 'ADMIN',
}

export class CreateRegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  phone: string;

  @IsString()
  @Matches(/^\d{16}$/, {
    message: 'National ID must be exactly 16 digits',
  })
  nationalId: string;

  @IsDateString()
  dateOfBirth: Date;

  @IsString()
  gender: string;

  @IsString()
  password: string;

  @IsString()
  province: string;

  @IsString()
  district: string;

  @IsString()
  sector: string;

  @IsString()
  cell: string;

  @IsString()
  village: string;

  @IsOptional()
  @IsInt()
  graduationYear?: number;

  @IsOptional()
  @IsString()
  graduationProgramFacility?: string;

  @IsOptional()
  @IsString()
  fieldOfGraduation?: string;

  @IsOptional()
  @IsString()
  workplace?: string;

  @IsOptional()
  @IsString()
  degreeCert?: string;

  @IsOptional()
  @IsString()
  nationalIdCopy?: string;

  @IsOptional()
  @IsString()
  license?: string;

  @IsOptional()
  @IsString()
  passportPhoto?: string;

  @IsEnum(RegisterRole)
  role: RegisterRole;
}

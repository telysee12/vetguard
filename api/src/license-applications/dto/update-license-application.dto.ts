import { PartialType } from '@nestjs/mapped-types';
import { CreateLicenseApplicationDto } from './create-license-application.dto';

export class UpdateLicenseApplicationDto extends PartialType(
  CreateLicenseApplicationDto,
) {}

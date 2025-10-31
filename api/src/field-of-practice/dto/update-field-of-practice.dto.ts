import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldOfPracticeDto } from './create-field-of-practice.dto';

export class UpdateFieldOfPracticeDto extends PartialType(CreateFieldOfPracticeDto) {}

import { Module } from '@nestjs/common';
import { FieldOfPracticeService } from './field-of-practice.service';
import { FieldOfPracticeController } from './field-of-practice.controller';

@Module({
  controllers: [FieldOfPracticeController],
  providers: [FieldOfPracticeService],
})
export class FieldOfPracticeModule {}

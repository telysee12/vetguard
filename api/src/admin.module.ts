import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { FieldOfPracticeModule } from './field-of-practice/field-of-practice.module';

@Module({
  imports: [PrismaModule, MailModule, FieldOfPracticeModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

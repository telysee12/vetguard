import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { LicensePdfService } from './license-pdf.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MailService, LicensePdfService],
  exports: [MailService, LicensePdfService],
})
export class MailModule {}

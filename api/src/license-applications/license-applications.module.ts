import { Module } from '@nestjs/common';
import { LicenseApplicationsService } from './license-applications.service';
import { LicenseApplicationsController } from './license-applications.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [LicenseApplicationsController],
  providers: [LicenseApplicationsService],
})
export class LicenseApplicationsModule {}

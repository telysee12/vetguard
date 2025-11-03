import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { RegisterModule } from './register/register.module';
import { PatientModule } from './patient/patient.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { ReportsModule } from './reports/reports.module';
import { UploadModule } from './upload/upload.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { LicenseApplicationsModule } from './license-applications/license-applications.module';
import { AdminModule } from './admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { MedicineModule } from './medicine/medicine.module';
import { FieldOfPracticeModule } from './field-of-practice/field-of-practice.module';
import { GlobalAuthGuard } from './auth/global-auth.guard';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RegisterModule,
    PatientModule,
    TreatmentsModule,
    ReportsModule,
    UploadModule,
    PasswordResetModule,
    LicenseApplicationsModule,
    AdminModule,
    MedicineModule,
    FieldOfPracticeModule,
    LocationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
})
export class AppModule {}

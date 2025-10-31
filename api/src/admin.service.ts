import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RegistrationStatus } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async updateRegistrationStatus(
    registrationId: number,
    status: RegistrationStatus,
    adminId: number,
    reason?: string,
  ) {
    const registration = await this.prisma.register.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException(
        `Registration with ID ${registrationId} not found.`,
      );
    }

    if (registration.status !== 'PENDING') {
      throw new BadRequestException(
        'This registration is not pending approval.',
      );
    }

    if (status === 'REJECTED' && !reason) {
      throw new BadRequestException('Rejection reason is required.');
    }

    const updated = await this.prisma.register.update({
      where: { id: registrationId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? reason : null,
        approvedBy: status === 'APPROVED' ? adminId : null,
        rejectedBy: status === 'REJECTED' ? adminId : null,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
    });
    // send email notification (non-blocking)
    const fullName =
      [updated.firstName, updated.lastName].filter(Boolean).join(' ').trim() ||
      undefined;
    if (status === 'APPROVED') {
      this.mail
        .sendRegistrationApproved(updated.email, fullName)
        .catch(() => {});
    } else if (status === 'REJECTED') {
      this.mail
        .sendRegistrationRejected(updated.email, fullName, reason)
        .catch(() => {});
    }
    return updated;
  }

  async getSectorDashboardData(
    sector: string,
    startDate?: string,
    endDate?: string,
  ) {
    const patientCount = await this.prisma.patient.count({
      where: {
        sector: sector,
      },
    });

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      // Add 1 day to endDate to include the whole day
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      dateFilter.lte = end;
    }

    // Treatments are counted based on the sector of the patient they belong to.
    const treatmentCount = await this.prisma.treatment.count({
      where: {
        patient: {
          sector: sector,
        },
        ...(Object.keys(dateFilter).length > 0 && {
          date: dateFilter,
        }),
      },
    });

    // Vets are counted based on their assigned sector.
    const vetCount = await this.prisma.register.count({
      where: {
        sector: sector,
        role: 'BASIC_VET',
        status: 'APPROVED',
      },
    });

    return {
      patientCount,
      treatmentCount,
      vetCount,
    };
  }
}

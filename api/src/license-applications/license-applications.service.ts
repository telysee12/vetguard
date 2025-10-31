import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LicensePdfService } from '../mail/license-pdf.service';
import { CreateLicenseApplicationDto } from './dto/create-license-application.dto';
import { UpdateLicenseApplicationDto } from './dto/update-license-application.dto';
import { UpdateLicenseStatusDto } from './dto/update-license-status.dto';

@Injectable()
export class LicenseApplicationsService {
  constructor(
    private prisma: PrismaService,
    private readonly mail: MailService,
    private readonly pdfService: LicensePdfService,
  ) {}

  create(createLicenseApplicationDto: CreateLicenseApplicationDto) {
    // The DTO from the controller has vetId, but the type doesn't show it.
    // We'll destructure it and build the correct Prisma query.
    const { vetId, specialization, ...data } = createLicenseApplicationDto as any;

    return this.prisma.vetLicenseApplication.create({
      data: {
        ...data, // This will include licenseType and paymentReceiptUrl
        fieldOfPractice: specialization, // Map specialization to fieldOfPractice
        status: "PENDING",
        vet: {
          connect: { id: vetId },
        },
      },
    });
  }

  findAll() {
    return this.prisma.vetLicenseApplication.findMany({
      include: {
        vet: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const application = await this.prisma.vetLicenseApplication.findUnique({
      where: { id },
      include: {
        vet: true,
      },
    });
    if (!application) {
      throw new NotFoundException(
        `License application with ID ${id} not found.`,
      );
    }
    return application;
  }

  async findMine(vetId: number) {
    return this.prisma.vetLicenseApplication.findFirst({
      where: { vetId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: number,
    updateLicenseApplicationDto: UpdateLicenseApplicationDto,
  ) {
    await this.findOne(id); // check if exists
    return this.prisma.vetLicenseApplication.update({
      where: { id },
      data: updateLicenseApplicationDto,
    });
  }

  async remove(id: number) {
    // Find license application to get the vetId
    const application = await this.findOne(id);
    if (!application) throw new NotFoundException('Application not found');
    // Delete the license application
    await this.prisma.vetLicenseApplication.delete({ where: { id } });
    // Delete the related registration
    if (application.vetId) {
      // Double-check that another license application does not exist for this vet
      const remainingApps = await this.prisma.vetLicenseApplication.count({ where: { vetId: application.vetId } });
      if (remainingApps === 0) {
        await this.prisma.register.delete({ where: { id: application.vetId } }).catch(() => {});
      }
    }
    return { success: true };
  }

  async updateStatus(id: number, dto: UpdateLicenseStatusDto) {
    await this.findOne(id); // validate exists
    const { status, reviewNotes } = dto;
    const updated = await this.prisma.vetLicenseApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        ...(dto.licenseNumber && { licenseNumber: dto.licenseNumber }),
      },
      include: {
        vet: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
    const to = updated.vet?.email;
    const fullName =
      [updated.vet?.firstName, updated.vet?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || undefined;
    if (to) {
      if (status === 'APPROVED') {
        // Generate PDF and send it as attachment
        this.pdfService
          .generateLicenseCardPdf(id)
          .then((pdfBuffer) => {
            return this.mail.sendLicenseApproved(to, fullName, pdfBuffer);
          })
          .catch((error) => {
            console.error('Failed to generate/send PDF:', error);
            // Send email without PDF as fallback
            this.mail.sendLicenseApproved(to, fullName).catch(() => {});
          });
      } else if (status === 'REJECTED') {
        this.mail
          .sendLicenseRejected(to, fullName, reviewNotes || undefined)
          .catch(() => {});
      }
    }
    return updated;
  }

  async verifyByLicenseNumber(licenseNumber: string) {
    const trimmed = licenseNumber.trim();
    const application = await this.prisma.vetLicenseApplication.findFirst({
      where: {
        licenseNumber: trimmed,
        status: 'APPROVED',
      },
      include: {
        vet: true,
      },
    });
    if (!application) {
      throw new NotFoundException('No valid license found with this number.');
    }
    const vet = application.vet;
    // Calculate validity and time left (12 months)
    const createdAt = application.createdAt;
    const validUntil = new Date(createdAt);
    validUntil.setMonth(validUntil.getMonth() + 12);
    const now = new Date();
    let remainingMonths = 0;
    let remainingDays = 0;
    if (now < validUntil) {
      const diffMs = validUntil.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      remainingMonths = Math.floor(diffDays / 30);
      remainingDays = diffDays % 30;
    }
    return {
      licenseNumber: application.licenseNumber,
      fieldOfPractice: application.fieldOfPractice, // Add the dynamic field value from the DB
      vet: vet
        ? {
            firstName: vet.firstName,
            lastName: vet.lastName,
            email: vet.email,
          }
        : {},
      status: application.status,
      createdAt,
      validUntil,
      remainingMonths,
      remainingDays,
    };
  }
}

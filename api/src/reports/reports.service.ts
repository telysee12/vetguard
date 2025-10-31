import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType } from '@prisma/client'; // Import ReportType enum

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: number) {
    return this.prisma.register.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        sector: true,
        district: true,
        province: true,
      },
    });
  }

  async create(data: {
    title: string;
    content: string;
    reportType: string;
    submittedBy: number;
    sector: string;
    district: string;
    province: string;
    attachments?: any; // Change type to any to handle array or string
    recommendation?: string; // Add recommendation field
    reviewedBy?: number; // Add reviewedBy field
    status?: string; // Add status field
  }) {
    if (!data.title || !data.content || !data.reportType || !data.submittedBy) {
      throw new BadRequestException('Missing required fields');
    }

    let attachmentsToSave: string | null = null;
    if (Array.isArray(data.attachments) && data.attachments.length > 0) {
      attachmentsToSave = JSON.stringify(data.attachments);
    } else if (typeof data.attachments === 'string') {
      attachmentsToSave = data.attachments;
    }

    return this.prisma.report.create({
      data: {
        title: data.title,
        content: data.content,
        reportType: data.reportType as any,
        submittedBy: data.submittedBy,
        sector: data.sector,
        district: data.district,
        province: data.province,
        attachments: attachmentsToSave,
        recommendation: data.recommendation || null, // Save recommendation
        reviewedBy: data.reviewedBy || null, // Save reviewedBy
        status: data.status as any || 'PENDING', // Set status
      },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
          },
        },
      },
    });
  }

  async findMine(userId: number) {
    return this.prisma.report.findMany({
      where: { submittedBy: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
          },
        },
      },
    });
  }

  async findBySector(sector: string) {
    return this.prisma.report.findMany({
      where: { sector },
      orderBy: { createdAt: 'desc' },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
          },
        },
      },
    });
  }

  async findByDistrict(district: string) {
    return this.prisma.report.findMany({
      where: { district },
      orderBy: { createdAt: 'desc' },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
          },
        },
      },
    });
  }

  // Sector Vet review: update status/notes; Basic Vet revision: edit title/content if status is REQUIRES_REVISION
  async update(id: number, userId: number, dto: any) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new BadRequestException('Report not found');

    const isSubmitter = report.submittedBy === userId;

    // Submitter can edit only when REQUIRES_REVISION; fields limited to title/content/attachments; status becomes PENDING
    if (isSubmitter && dto.submitterEdit === true) {
      if (report.status !== 'REQUIRES_REVISION') {
        throw new ForbiddenException(
          'Report cannot be edited unless it requires revision',
        );
      }
      const data: any = {};
      if (dto.title) data.title = dto.title;
      if (dto.content) data.content = dto.content;
      if (dto.attachments !== undefined) data.attachments = dto.attachments;
      data.status = 'PENDING';
      return this.prisma.report.update({ where: { id }, data });
    }

    // Otherwise treat as Sector Vet review (status/notes/reviewer)
    const data: any = {};
    if (dto.status) data.status = dto.status;
    if (dto.sectorVetNotes !== undefined)
      data.sectorVetNotes = dto.sectorVetNotes;
    if (dto.reviewedBy) {
      data.reviewedBy = Number(dto.reviewedBy);
      data.reviewedAt = new Date();
    }
    // District-level review fields
    if (dto.districtVetNotes !== undefined)
      data.districtVetNotes = dto.districtVetNotes;
    if (dto.districtReviewedBy) {
      data.districtReviewedBy = Number(dto.districtReviewedBy);
      data.districtReviewedAt = new Date();
    }
    return this.prisma.report.update({ where: { id }, data });
  }

  // Get reports submitted by Basic Vets in a specific sector (for Sector Vet review)
  async findBasicVetReportsBySector(sector: string) {
    return this.prisma.report.findMany({
      where: {
        sector: sector,
        submitter: {
          role: 'BASIC_VET',
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
            role: true,
          },
        },
      },
    });
  }

  // Get reports submitted by Sector Vets in a specific district (for District Vet review)
  // Excludes reports submitted by the current user
  async findSectorVetReportsByDistrict(district: string, excludeUserId?: number) {
    return this.prisma.report.findMany({
      where: {
        district: district,
        submittedBy: excludeUserId ? { not: excludeUserId } : undefined,
        submitter: {
          role: 'SECTOR_VET',
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
            role: true,
          },
        },
      },
    });
  }

  // Get all reports submitted by Sector Vets
  async findAllSectorVetReports() {
    return this.prisma.report.findMany({
      where: {
        submitter: {
          role: 'SECTOR_VET',
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
            role: true,
          },
        },
      },
    });
  }

  // Country-level review: update country status and notes
  async updateDistrictReview(
    id: number,
    userId: number,
    dto: {
      status?: string;
      districtVetNotes?: string;
    },
  ) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new BadRequestException('Report not found');

    const data: any = {};
    if (dto.status) data.status = dto.status;
    if (dto.districtVetNotes !== undefined)
      data.districtVetNotes = dto.districtVetNotes;

    data.districtReviewedBy = userId;
    data.districtReviewedAt = new Date();

    return this.prisma.report.update({
      where: { id },
      data,
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            sector: true,
            district: true,
            role: true,
          },
        },
      },
    });
  }

  // Submitter can delete when REJECTED
  async remove(id: number, userId: number) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new BadRequestException('Report not found');
    if (report.submittedBy !== userId)
      throw new ForbiddenException('Not owner');
    if (report.status !== 'REJECTED') {
      throw new ForbiddenException(
        'Only REJECTED reports can be deleted by submitter',
      );
    }
    return this.prisma.report.delete({ where: { id } });
  }

  async generatePharmaceuticalReportContent(
    startDate: string,
    endDate: string,
  ): Promise<{ content: string }> {
    // Fetch stock movements within the date range
    const stockMovements = await this.prisma.medicineStockMovement.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        medicine: true, // Include medicine details
      },
      orderBy: { createdAt: 'asc' },
    });

    let reportContent = `Pharmaceutical Report from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}\n\n`;

    if (stockMovements.length === 0) {
      reportContent += 'No stock movements recorded for this period.';
    } else {
      reportContent += 'Stock Movements:\n\n';
      stockMovements.forEach((movement) => {
        reportContent += `  Medicine: ${movement.medicine.name}\n`;
        reportContent += `  Type: ${movement.type === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}\n`;
        reportContent += `  Quantity: ${movement.quantity} ${movement.medicine.unit}\n`;
        reportContent += `  Date: ${movement.createdAt.toLocaleString()}\n`;
        reportContent += `  Description: ${movement.medicine.description || 'N/A'}\n\n`;
      });
    }
    return { content: reportContent };
  }
}

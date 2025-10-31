import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegisterDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(data: CreateRegisterDto) {
    const { dateOfBirth, password, ...rest } = data as unknown as {
      dateOfBirth: string | Date;
      password: string;
      [key: string]: unknown;
    };

    const parsedDob =
      typeof dateOfBirth === 'string'
        ? new Date(`${dateOfBirth}T00:00:00.000Z`)
        : new Date(dateOfBirth);

    if (isNaN(parsedDob.getTime())) {
      throw new BadRequestException(
        'Invalid dateOfBirth format. Expected YYYY-MM-DD',
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const created = await this.prisma.register.create({
        data: {
          ...rest,
          password: hashedPassword,
          dateOfBirth: parsedDob,
          status: 'PENDING',
        } as unknown as CreateRegisterDto,
      });
      // fire-and-forget email
      this.mail
        .sendRegistrationReceived(
          created.email,
          [created.firstName, created.lastName]
            .filter(Boolean)
            .join(' ')
            .trim() || undefined,
        )
        .catch(() => {});
      return created;
    } catch (error: any) {
      // Prisma unique constraint error
      if (error.code === 'P2002' && error.meta?.target) {
        if (error.meta.target.includes('email')) {
          throw new ConflictException({
            message:
              'The email you entered is already registered. Please use a different one.',
            error: 'Email Already Exists',
            statusCode: 409,
          });
        }
        if (error.meta.target.includes('phone')) {
          throw new ConflictException({
            message:
              'The phone number you entered is already registered. Please use a different one.',
            error: 'Phone Already Exists',
            statusCode: 409,
          });
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  async findAll() {
    return this.prisma.register.findMany();
  }

  async findPending() {
    return this.prisma.register.findMany({ where: { status: 'PENDING' } });
  }

  async findPendingBasicVets() {
    return this.prisma.register.findMany({
      where: {
        role: 'BASIC_VET',
        status: 'PENDING',
      },
    });
  }

  async findBasicVets() {
    return this.prisma.register.findMany({
      where: { role: 'BASIC_VET', status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number, approvedBy: number) {
    const register = await this.prisma.register.findUnique({ where: { id } });
    if (!register) throw new NotFoundException('Register not found');
    return this.prisma.register.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || null,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectionReason: null,
      },
    });
  }

  async approveVet(id: number) {
    return this.prisma.register.update({
      where: { id },
      data: { status: 'APPROVED', rejectionReason: null },
    });
  }

  async reject(id: number, rejectedBy: number, rejectionReason?: string) {
    const register = await this.prisma.register.findUnique({ where: { id } });
    if (!register) throw new NotFoundException('Register not found');
    return this.prisma.register.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: rejectedBy || null,
        rejectionReason,
      },
    });
  }

  async rejectVet(id: number, reason: string) {
    return this.prisma.register.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason },
    });
  }

  async findOne(id: number) {
    if (!id && id !== 0) {
      throw new BadRequestException('User id is required');
    }
    return this.prisma.register.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        province: true,
        district: true,
        sector: true,
        cell: true,
        village: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, data: UpdateRegisterDto) {
    const register = await this.prisma.register.findUnique({ where: { id } });
    if (!register) throw new NotFoundException('Register not found');
    return this.prisma.register.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const register = await this.prisma.register.findUnique({ where: { id } });
    if (!register) throw new NotFoundException('Register not found');
    // Delete all related vet license applications first
    await this.prisma.vetLicenseApplication.deleteMany({ where: { vetId: id } });
    // Then delete the vet register record
    return this.prisma.register.delete({ where: { id } });
  }

  async findBySector(sector: string) {
    return this.prisma.register.findMany({
      where: { sector },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDistrict(district: string) {
    return this.prisma.register.findMany({
      where: { district },
      orderBy: { createdAt: 'desc' },
    });
  }
}

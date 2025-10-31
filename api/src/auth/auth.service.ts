import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.register.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Only allow login for APPROVED users, except ADMIN can always login
      if (user.role !== 'ADMIN') {
        const userStatus = (user as any).status;
        if (userStatus === 'PENDING') {
          throw new UnauthorizedException('Waiting');
        }
        if (userStatus !== 'APPROVED') {
          return null;
        }
      }
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      sector: user.sector,
      district: user.district,
      province: user.province,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        province: user.province,
        district: user.district,
        sector: user.sector,
        isFirstLogin: user.isFirstLogin || false,
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.prisma.register.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        province: true,
        district: true,
        sector: true,
        phone: true,
        nationalId: true,
        dateOfBirth: true,
        gender: true,
        graduationYear: true,
        workplace: true,
        isFirstLogin: true,
        passportPhoto: true,
      },
    });
    return user;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.register.findUnique({
      where: { id: userId },
    });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.register.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        isFirstLogin: false,
      },
    });
  }

  async updateEmail(userId: number, newEmail: string) {
    // Check if email already exists
    const existingUser = await this.prisma.register.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.register.update({
      where: { id: userId },
      data: {
        email: newEmail,
        isFirstLogin: false,
      },
    });
  }

  async updatePassportPhoto(userId: number, passportPhotoUrl: string | undefined) {
    const user = await this.prisma.register.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.prisma.register.update({
      where: { id: userId },
      data: {
        passportPhoto: passportPhotoUrl,
      },
    });
  }

  async createUser(userData: any, createdBy: number) {
    // Check if email already exists
    const existingUser = await this.prisma.register.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { dateOfBirth, ...rest } = userData;

    const parsedDob =
      typeof dateOfBirth === 'string'
        ? new Date(`${dateOfBirth}T00:00:00.000Z`)
        : new Date(dateOfBirth);

    if (isNaN(parsedDob.getTime())) {
      throw new BadRequestException(
        'Invalid dateOfBirth format. Expected YYYY-MM-DD',
      );
    }

    return this.prisma.register.create({
      data: {
        ...rest,
        dateOfBirth: parsedDob,
        password: hashedPassword,
        createdBy,
        status: 'APPROVED',
      },
    });
  }
}

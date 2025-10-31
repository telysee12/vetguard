import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  ValidationPipe,
  Put,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { RegisterRole } from '../register/dto/create-register.dto';
import { UpdatePassportPhotoDto } from './dto/update-profile.dto';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdateEmailDto {
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{16}$/, {
    message: 'National ID must be exactly 16 digits',
  })
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  sector: string;

  @IsString()
  @IsNotEmpty()
  cell: string;

  @IsString()
  @IsNotEmpty()
  village: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  graduationYear?: number;
  graduationProgramFacility?: string;
  fieldOfGraduation?: string;
  workplace?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.getUserById(Number(req.user.sub));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      Number(req.user.sub),
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-email')
  async updateEmail(
    @Request() req,
    @Body(ValidationPipe) updateEmailDto: UpdateEmailDto,
  ) {
    return this.authService.updateEmail(
      Number(req.user.sub),
      updateEmailDto.newEmail,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-passport-photo')
  async updatePassportPhoto(
    @Request() req,
    @Body(ValidationPipe) updatePassportPhotoDto: UpdatePassportPhotoDto,
  ) {
    return this.authService.updatePassportPhoto(
      Number(req.user.sub),
      updatePassportPhotoDto.passportPhotoUrl,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-user')
  async createUser(
    @Request() req,
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ) {
    // Only Admin can create users
    if (req.user.role !== RegisterRole.ADMIN) {
      throw new UnauthorizedException('Only Admin can create users');
    }

    return this.authService.createUser(createUserDto, Number(req.user.sub));
  }
}

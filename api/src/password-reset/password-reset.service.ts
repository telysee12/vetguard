import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class PasswordResetService {
  constructor(private readonly prisma: PrismaService) {}

  // Step 1: Request OTP and send email
  async requestReset(email: string) {
    const user = await this.prisma.register.findUnique({
      where: { email, status: 'APPROVED' },
    });

    // For security, we don't reveal if an email is registered or not.
    // We proceed as if the email was sent, even if the user doesn't exist or isn't approved.
    if (!user) {
      console.warn(
        `Password reset requested for non-existent or non-approved user: ${email}`,
      );
      return {
        message: 'If an account with this email exists, an OTP has been sent.',
      };
    }

    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

    // Use upsert to create a new record or update an existing one for the same email.
    await this.prisma.passwordReset.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
    });

    // Check if email credentials are configured before attempting to send an email.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
        'Failed to send password reset email: EMAIL_USER and/or EMAIL_PASS environment variables are not set.',
      );
      // We still return a success-like message to the user for security reasons,
      // to avoid revealing whether the email functionality is configured.
      return {
        message: 'If an account with this email exists, an OTP has been sent.',
      };
    }

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER, // Ensure these are in your .env file
        pass: process.env.EMAIL_PASS, // e.g., a Gmail App Password
      },
    });

    try {
      await transporter.sendMail({
        from: `"VetGard System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Password Reset OTP',
        text: `Your One-Time Password (OTP) for password reset is: ${otp}. It will expire in 15 minutes.`,
        html: `<p>Your One-Time Password (OTP) for password reset is: <strong>${otp}</strong></p><p>This OTP will expire in 15 minutes.</p>`,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Do not throw an error to the client to prevent email enumeration.
    }

    return {
      message: 'If an account with this email exists, an OTP has been sent.',
    };
  }

  // Step 2: Verify OTP and reset password
  async verifyOtpAndReset(email: string, otp: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date(), // Check if the token is not expired
        },
      },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.register.update({
      where: { email },
      data: { password: hashedPassword, isFirstLogin: false }, // Also mark as not first login
    });

    // Clean up all reset tokens for this email after successful password change
    await this.prisma.passwordReset.deleteMany({ where: { email } });

    return { message: 'Your password has been reset successfully.' };
  }
}

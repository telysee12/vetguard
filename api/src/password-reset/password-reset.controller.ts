import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  // Step 1: Request OTP (send email)
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestReset(@Body() requestResetDto: RequestResetDto) {
    return this.passwordResetService.requestReset(requestResetDto.email);
  }

  // Step 2: Verify OTP and set new password
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async verifyOtpAndReset(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passwordResetService.verifyOtpAndReset(
      resetPasswordDto.email,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
    );
  }
}

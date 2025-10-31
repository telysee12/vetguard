import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';

class RejectDto {
  reason: string;
}

@Controller('admin')
// @UseGuards(AuthGuard('jwt')) // Protect all routes in this controller
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('register/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveRegistration(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    // const adminId = req.user.id; // Assuming user is available on request
    const adminId = 1; // Mock admin ID
    return this.adminService.updateRegistrationStatus(id, 'APPROVED', adminId);
  }

  @Patch('register/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectRegistration(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectDto,
    @Req() req: any,
  ) {
    // const adminId = req.user.id;
    const adminId = 1; // Mock admin ID
    return this.adminService.updateRegistrationStatus(
      id,
      'REJECTED',
      adminId,
      rejectDto.reason,
    );
  }

  @Get('dashboard/sector-stats')
  async getSectorDashboardStats(
    @Query('sector') sector: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!sector) {
      throw new BadRequestException('Sector query parameter is required.');
    }
    return this.adminService.getSectorDashboardData(sector, startDate, endDate);
  }
}

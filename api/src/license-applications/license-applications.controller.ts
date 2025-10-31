import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { LicenseApplicationsService } from './license-applications.service';
import { CreateLicenseApplicationDto } from './dto/create-license-application.dto';
import { UpdateLicenseApplicationDto } from './dto/update-license-application.dto';
import { UpdateLicenseStatusDto } from './dto/update-license-status.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('license-applications')
@UseGuards(AuthGuard('jwt'))
export class LicenseApplicationsController {
  constructor(
    private readonly licenseApplicationsService: LicenseApplicationsService,
  ) {}

  @Post()
  create(
    @Body(new ValidationPipe()) createLicenseApplicationDto: CreateLicenseApplicationDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    // Ensure the user is creating their own application
    return this.licenseApplicationsService.create({
      ...createLicenseApplicationDto,
      vetId: userId,
    });
  }

  @Get()
  findAll() {
    // This should probably be restricted to ADMIN role in a real app
    return this.licenseApplicationsService.findAll();
  }

  @Get('mine')
  findMine(@Req() req: any) {
    const userId = req.user.sub;
    return this.licenseApplicationsService.findMine(userId);
  }

  @Get('verify/:licenseNumber')
  @UseGuards() // override and remove authentication guards for this endpoint
  async verifyLicense(@Param('licenseNumber') licenseNumber: string) {
    // This method will be implemented in the service next
    return this.licenseApplicationsService.verifyByLicenseNumber(licenseNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.licenseApplicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLicenseApplicationDto: UpdateLicenseApplicationDto,
  ) {
    return this.licenseApplicationsService.update(
      id,
      updateLicenseApplicationDto,
    );
  }

  // Endpoint for updating application status (approve/reject)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLicenseStatusDto: UpdateLicenseStatusDto,
  ) {
    return this.licenseApplicationsService.updateStatus(
      id,
      updateLicenseStatusDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.licenseApplicationsService.remove(id);
  }
}

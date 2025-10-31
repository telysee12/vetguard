import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    const submittedBy = req.user.sub;
    // Accept both JSON and FormData-mapped JSON (frontend sends FormData without files for now)
    const dto = {
      title: body.title,
      content: body.content,
      reportType: body.reportType,
      submittedBy,
      sector: body.sector,
      district: body.district,
      province: body.province,
      attachments: body.attachments ?? null,
    };
    return this.reportsService.create(dto);
  }

  @Get('mine')
  async mine(@Request() req: any) {
    return this.reportsService.findMine(req.user.sub);
  }

  @Get('sector/:sector')
  async bySector(@Param('sector') sector: string) {
    return this.reportsService.findBySector(sector);
  }

  @Get('district/:district')
  async byDistrict(@Param('district') district: string) {
    return this.reportsService.findByDistrict(district);
  }

  @Get('basic-vet-reports/sector/:sector')
  async getBasicVetReportsBySector(@Param('sector') sector: string, @Request() req: any) {
    // Verify the requesting user is a Sector Vet and has access to this sector
    const user = await this.reportsService.getUserById(req.user.sub);
    if (!user || user.role !== 'SECTOR_VET' || user.sector !== sector) {
      throw new ForbiddenException('Access denied: Only Sector Vets can access reports from their sector');
    }
    return this.reportsService.findBasicVetReportsBySector(sector);
  }

  @Get('sector-vet-reports/district/:district')
  async getSectorVetReportsByDistrict(@Param('district') district: string, @Request() req: any) {
    // Verify the requesting user is a District Vet and has access to this district
    const user = await this.reportsService.getUserById(req.user.sub);
    if (!user || user.role !== 'ADMIN' || user.district !== district) {
      throw new ForbiddenException('Access denied: Only District Vets can access reports from their district');
    }
    // Exclude reports submitted by the current District Vet
    return this.reportsService.findSectorVetReportsByDistrict(district, user.id);
  }

  @Get('all-sector-vet-reports')
  async getAllSectorVetReports(@Request() req: any) {
    // Verify the requesting user is an Admin
    const user = await this.reportsService.getUserById(req.user.sub);
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied: Only Admin can access all Sector Vet reports');
    }
    return this.reportsService.findAllSectorVetReports();
  }

  @Patch(':id/district-review')
  async updateDistrictReview(
    @Param('id') id: string,
    @Body() body: { status?: string; districtVetNotes?: string },
    @Request() req: any,
  ) {
    return this.reportsService.updateDistrictReview(
      Number(id),
      req.user.sub,
      body,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(Number(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.reportsService.update(Number(id), req.user.sub, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.remove(Number(id), req.user.sub);
  }

  @Post('pharmaceutical')
  async generatePharmaceuticalReport(
    @Body() body: { startDate: string; endDate: string; },
    @Request() req: any,
  ) {
    const { startDate, endDate } = body;
    return this.reportsService.generatePharmaceuticalReportContent(
      startDate,
      endDate,
    );
  }
}

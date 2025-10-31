import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  create(@Request() req: any, @Body() createPatientDto: CreatePatientDto) {
    const data: any = { ...createPatientDto };
    if (!data.veterinarianId && req?.user?.sub) {
      data.veterinarianId = Number(req.user.sub);
    }
    return this.patientService.create(data);
  }

  @Get()
  findAll() {
    return this.patientService.findAll();
  }

  @Get('sector/:sector')
  findBySector(@Param('sector') sector: string) {
    return this.patientService.findBySector(sector);
  }

  @Get('district/:district')
  findByDistrict(@Param('district') district: string) {
    return this.patientService.findByDistrict(district);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(Number(id), updatePatientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(Number(id));
  }
}

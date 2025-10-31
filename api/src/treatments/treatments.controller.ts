import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('treatments')
@UseGuards(JwtAuthGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  create(@Body() createTreatmentDto: CreateTreatmentDto) {
    return this.treatmentsService.create(createTreatmentDto);
  }

  @Get()
  findAll() {
    return this.treatmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treatmentsService.findOne(Number(id));
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.treatmentsService.findByPatient(Number(patientId));
  }

  @Get('sector/:sector')
  findBySector(@Param('sector') sector: string) {
    return this.treatmentsService.findBySector(sector);
  }

  @Get('district/:district')
  findByDistrict(@Param('district') district: string) {
    return this.treatmentsService.findByDistrict(district);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    return this.treatmentsService.update(Number(id), updateTreatmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentsService.remove(Number(id));
  }
}

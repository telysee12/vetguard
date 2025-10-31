import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: createPatientDto,
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      include: { veterinarian: true, treatments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.patient.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
    });
  }

  async remove(id: number) {
    return this.prisma.patient.delete({
      where: { id },
    });
  }

  async findBySector(sector: string) {
    const s = (sector || '').trim();
    return this.prisma.patient.findMany({
      where: {
        OR: [{ sector: s }, { veterinarian: { sector: s } }],
      },
      orderBy: { createdAt: 'desc' },
      include: { veterinarian: true, treatments: true },
    });
  }

  async findByDistrict(district: string) {
    const d = (district || '').trim();
    return this.prisma.patient.findMany({
      where: {
        OR: [{ district: d }, { veterinarian: { district: d } }],
      },
      orderBy: { createdAt: 'desc' },
      include: { veterinarian: true, treatments: true },
    });
  }
}

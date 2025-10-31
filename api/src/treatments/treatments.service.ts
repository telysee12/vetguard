import { Injectable } from '@nestjs/common';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TreatmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTreatmentDto: CreateTreatmentDto) {
    const { patientId, date, diagnosis, notes, medications, veterinarianId } =
      createTreatmentDto;

    // Combine diagnosis and notes into diagnosisAndNotes
    const diagnosisAndNotes =
      diagnosis && notes
        ? `${diagnosis} - ${notes}`
        : diagnosis || notes || null;

    // Convert medications array to comma-separated string
    const medicinesAndPrescription =
      medications && medications.length > 0 ? medications.join(', ') : null;

    return this.prisma.treatment.create({
      data: {
        patientId: Number(patientId),
        veterinarianId: Number(veterinarianId),
        date: new Date(date),
        diagnosisAndNotes,
        medicinesAndPrescription,
      },
    });
  }

  async findAll() {
    return this.prisma.treatment.findMany({
      include: { patient: true, veterinarian: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.treatment.findUnique({
      where: { id },
      include: { patient: true, veterinarian: true },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.treatment.findMany({
      where: { patientId: Number(patientId) },
      include: { patient: true, veterinarian: true },
    });
  }

  async update(id: number, updateTreatmentDto: UpdateTreatmentDto) {
    const { date, diagnosis, notes, medications } = updateTreatmentDto;

    // Combine diagnosis and notes into diagnosisAndNotes
    const diagnosisAndNotes =
      diagnosis && notes
        ? `${diagnosis} - ${notes}`
        : diagnosis || notes || null;

    // Convert medications array to comma-separated string
    const medicinesAndPrescription =
      medications && medications.length > 0 ? medications.join(', ') : null;

    return this.prisma.treatment.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        diagnosisAndNotes,
        medicinesAndPrescription,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.treatment.delete({
      where: { id },
    });
  }

  async findBySector(sector: string) {
    const s = (sector || '').trim();
    return this.prisma.treatment.findMany({
      where: {
        OR: [
          { patient: { sector: { equals: s } } },
          { veterinarian: { sector: { equals: s } } },
        ],
      },
      orderBy: { date: 'desc' },
      include: { patient: true, veterinarian: true },
    });
  }

  async findByDistrict(district: string) {
    const d = (district || '').trim();
    return this.prisma.treatment.findMany({
      where: {
        OR: [
          { patient: { district: { equals: d } } },
          { veterinarian: { district: { equals: d } } },
        ],
      },
      orderBy: { date: 'desc' },
      include: { patient: true, veterinarian: true },
    });
  }
}

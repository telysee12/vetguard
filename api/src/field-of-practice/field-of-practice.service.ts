import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFieldOfPracticeDto } from './dto/create-field-of-practice.dto';
import { UpdateFieldOfPracticeDto } from './dto/update-field-of-practice.dto';

@Injectable()
export class FieldOfPracticeService {
  constructor(private prisma: PrismaService) {}

  async create(createFieldOfPracticeDto: CreateFieldOfPracticeDto) {
    return this.prisma.fieldOfPractice.create({
      data: createFieldOfPracticeDto,
    });
  }

  async findAll() {
    return this.prisma.fieldOfPractice.findMany();
  }

  async findOne(id: number) {
    return this.prisma.fieldOfPractice.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateFieldOfPracticeDto: UpdateFieldOfPracticeDto) {
    return this.prisma.fieldOfPractice.update({
      where: { id },
      data: updateFieldOfPracticeDto,
    });
  }

  async remove(id: number) {
    return this.prisma.fieldOfPractice.delete({
      where: { id },
    });
  }
}

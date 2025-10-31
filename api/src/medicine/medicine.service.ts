import { Injectable } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MedicineGateway } from './medicine.gateway';

@Injectable()
export class MedicineService {
  constructor(
    private prisma: PrismaService,
    private medicineGateway: MedicineGateway,
  ) {}

  async create(createMedicineDto: CreateMedicineDto) {
    const { veterinarianId, ...restOfDto } = createMedicineDto;
    const medicine = await this.prisma.medicine.create({
      data: {
        ...restOfDto,
        totalStock: restOfDto.currentStock,
        stockIn: restOfDto.currentStock,
        veterinarian: {
          connect: { id: veterinarianId },
        },
      },
    });

    if (medicine.currentStock > 0) {
      await this.prisma.medicineStockMovement.create({
        data: {
          medicineId: medicine.id,
          quantity: medicine.currentStock,
          type: 'STOCK_IN',
        },
      });
    }

    this.medicineGateway.broadcastMedicineUpdate(medicine);
    return medicine;
  }

  findAll() {
    return this.prisma.medicine.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.medicine.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    const updatedMedicine = await this.prisma.medicine.update({
      where: { id },
      data: updateMedicineDto,
    });
    this.medicineGateway.broadcastMedicineUpdate(updatedMedicine);
    return updatedMedicine;
  }

  async stockInMedicine(id: number, quantity: number) {
    const updatedMedicine = await this.prisma.$transaction(async (prisma) => {
      const medicine = await prisma.medicine.update({
        where: { id },
        data: {
          currentStock: { increment: quantity },
          stockIn: { increment: quantity },
          totalStock: { increment: quantity },
        },
      });

      await prisma.medicineStockMovement.create({
        data: { medicineId: id, quantity, type: 'STOCK_IN' },
      });

      return medicine;
    });
    this.medicineGateway.broadcastMedicineUpdate(updatedMedicine);
    return updatedMedicine;
  }

  async stockOutMedicine(id: number, quantity: number) {
    const updatedMedicine = await this.prisma.medicine.update({
      where: { id },
      data: {
        currentStock: { decrement: quantity },
        stockOut: { increment: quantity },
      },
    });

    await this.prisma.medicineStockMovement.create({
      data: { medicineId: id, quantity, type: 'STOCK_OUT' },
    });

    this.medicineGateway.broadcastMedicineUpdate(updatedMedicine);
    return updatedMedicine;
  }

  async remove(id: number) {
    await this.prisma.medicineStockMovement.deleteMany({ where: { medicineId: id } });
    const deletedMedicine = await this.prisma.medicine.delete({ where: { id } });
    this.medicineGateway.broadcastMedicineUpdate({ id, _deleted: true });
    return deletedMedicine;
  }
}

import { Module } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MedicineGateway } from './medicine.gateway'; // WebSocket Gateway for real-time updates

@Module({
  imports: [PrismaModule],
  controllers: [MedicineController],
  providers: [MedicineService, MedicineGateway], // Register the WebSocket gateway
})
export class MedicineModule {}

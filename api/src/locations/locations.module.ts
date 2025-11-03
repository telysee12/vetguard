import { Module } from '@nestjs/common';
import { LocationsController, VillagesQueryController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  controllers: [LocationsController, VillagesQueryController],
  providers: [LocationsService],
})
export class LocationsModule {}



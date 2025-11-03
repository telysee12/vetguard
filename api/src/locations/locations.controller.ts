import { Controller, Get, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}
  // GET /api/v1/locations/cells/:cell/villages → ["Village A", "Village B", ...]
  @Get('cells/:cell/villages')
  getVillagesByCellArray(@Param('cell') cell: string) {
    const villages = this.locations.getVillagesByCell(cell);
    return villages;
  }

  // GET /api/v1/locations/villages/:cell → { villages: ["Village A", ...] }
  @Get('villages/:cell')
  getVillagesByCellObject(@Param('cell') cell: string) {
    const villages = this.locations.getVillagesByCell(cell);
    return { villages };
  }
}

// Support query form used by frontend attempt: /api/v1/villages?cell=...
@Controller()
export class VillagesQueryController {
  @Get('villages')
  getVillagesQuery(@Query('cell') cell?: string) {
    if (!cell) return [];
    // instantiate service ad-hoc to avoid circular module import for this lightweight endpoint
    const temp = new LocationsService();
    return temp.getVillagesByCell(cell);
  }
}



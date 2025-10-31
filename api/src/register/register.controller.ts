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
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateRegisterDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post()
  create(@Body() createRegisterDto: CreateRegisterDto) {
    return this.registerService.create(createRegisterDto);
  }

  @Get()
  findAll() {
    return this.registerService.findAll();
  }

  // Only Admin should manage approvals
  @UseGuards(JwtAuthGuard)
  @Get('pending')
  findPending(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'Only Admin can view pending registrations',
      );
    }
    return this.registerService.findPending();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  async approveVet(@Param('id') id: string) {
    return this.registerService.approveVet(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  async rejectVet(@Param('id') id: string, @Body('reason') reason: string) {
    return this.registerService.rejectVet(Number(id), reason);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registerService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegisterDto: UpdateRegisterDto,
  ) {
    return this.registerService.update(Number(id), updateRegisterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registerService.remove(Number(id));
  }

  @Get('pending-basic-vets')
  async getPendingBasicVets() {
    return this.registerService.findPendingBasicVets();
  }

  @Get('basic-vets')
  async getBasicVets() {
    return this.registerService.findBasicVets();
  }

  @Get('sector/:sector')
  findBySector(@Param('sector') sector: string) {
    return this.registerService.findBySector(sector);
  }

  @Get('district/:district')
  findByDistrict(@Param('district') district: string) {
    return this.registerService.findByDistrict(district);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req: any) {
    return this.registerService.findOne(Number(req.user.sub));
  }
}

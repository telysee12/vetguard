import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FieldOfPracticeService } from './field-of-practice.service';
import { CreateFieldOfPracticeDto } from './dto/create-field-of-practice.dto';
import { UpdateFieldOfPracticeDto } from './dto/update-field-of-practice.dto';

@Controller('field-of-practice')
export class FieldOfPracticeController {
  constructor(private readonly fieldOfPracticeService: FieldOfPracticeService) {}

  @Post()
  async create(@Body() createFieldOfPracticeDto: CreateFieldOfPracticeDto) {
    return await this.fieldOfPracticeService.create(createFieldOfPracticeDto);
  }

  @Get()
  async findAll() {
    return await this.fieldOfPracticeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.fieldOfPracticeService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFieldOfPracticeDto: UpdateFieldOfPracticeDto) {
    return await this.fieldOfPracticeService.update(+id, updateFieldOfPracticeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.fieldOfPracticeService.remove(+id);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesDto } from './warehouses.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('warehouses')
@ApiTags('Warehouses')
export class WarehousesController {
  constructor(private readonly warehouseService: WarehousesService) {}

  @Get()
  async findAll(): Promise<WarehousesDto[]> {
    return this.warehouseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<WarehousesDto> {
    return this.warehouseService.findOne(id);
  }
}

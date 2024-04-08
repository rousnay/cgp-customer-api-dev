import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesDto } from './warehouses.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('warehouses')
@ApiTags('Warehouses')
export class WarehousesController {
  constructor(private readonly warehouseService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({
    status: 200,
    description: 'Get the list of warehouse',
    content: {
      'application/json': {
        example: {
          message: 'Warehouse list fetched successfully',
          status: 'success',
          data: [
            {
              id: '1',
              name: 'test warehouse',
              abn_number: 'W666',
              active: 1,
              created_at: '2024-04-03T23:21:00.000Z',
              updated_at: '2024-04-03T23:21:00.000Z',
            },
          ],
        },
      },
    },
  })
  async findAll(): Promise<{
    message: string;
    status: string;
    data: WarehousesDto[];
  }> {
    return {
      message: 'Warehouse list fetched successfully',
      status: 'success',
      data: await this.warehouseService.findAll(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the warehouse by id' })
  @ApiResponse({
    status: 200,
    description: 'Get the warehouse by id specified',
    content: {
      'application/json': {
        example: {
          message: 'Warehouse with specified id fetched successfully',
          status: 'success',
          data: {
            id: '1',
            name: 'test warehouse',
            abn_number: 'W666',
            active: 1,
            created_at: '2024-04-03T23:21:00.000Z',
            updated_at: '2024-04-03T23:21:00.000Z',
          },
        },
      },
    },
  })
  async findOne(@Param('id') id: number): Promise<{
    message: string;
    status: string;
    data: WarehousesDto;
  }> {
    const warehouse = await this.warehouseService.findOne(id);
    if (warehouse === undefined || warehouse === null) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return {
      message: 'Warehouse with specified id fetched successfully',
      status: 'success',
      data: warehouse,
    };
  }
}

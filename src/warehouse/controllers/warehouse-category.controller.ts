import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WarehouseCategoryService } from '../services/warehouse-category.services';
import { WarehousesDto } from '../dtos/warehouses.dto';

@Controller('categories/:categoryId/warehouse')
@ApiTags('Warehouses')
export class WarehouseCategoryController {
  constructor(
    private readonly warehouseCategoryService: WarehouseCategoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products from a category' })
  async findWarehousesByCategoryId(
    @Param('categoryId') categoryId: number,
  ): Promise<{ message: string; status: string; data: WarehousesDto[] }> {
    const warehouses =
      await this.warehouseCategoryService.findWarehousesByCategoryId(
        categoryId,
      );
    if (!warehouses || warehouses.length === 0) {
      throw new NotFoundException(
        `No warehouses found that offers products for category with id ${categoryId}`,
      );
    }
    return {
      message:
        'All warehouses that offers products for the category fetched successfully',
      status: 'success',
      data: warehouses,
    };
  }
}

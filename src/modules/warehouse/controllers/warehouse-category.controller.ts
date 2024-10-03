import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WarehousesDto } from '../dtos/warehouses.dto';
import { WarehouseCategoryService } from '../services/warehouse-category.services';

@Controller('categories/:categoryId/warehouse')
@ApiTags('Warehouses')
export class WarehouseCategoryController {
  constructor(
    private readonly warehouseCategoryService: WarehouseCategoryService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all warehouses that offers products for a given category',
  })
  async findWarehousesByCategoryId(
    @Param('categoryId') categoryId: number,
    @Query('page') page?: number | undefined,
    @Query('perPage') perPage?: number | undefined,
  ): Promise<{ message: string; status: string; data: WarehousesDto[] }> {
    page = page || 1;
    perPage = perPage || 10;
    const warehouses =
      await this.warehouseCategoryService.findWarehousesByCategoryIdPage(
        categoryId,
        page,
        perPage,
      );

    if (!warehouses || warehouses.length === 0) {
      throw new NotFoundException(
        `No warehouses found that offers products for category with id ${categoryId}`,
      );
    }
    return {
      status: 'success',
      message:
        'All warehouses that offers products for the category fetched successfully',
      ...warehouses,
    };
  }
}

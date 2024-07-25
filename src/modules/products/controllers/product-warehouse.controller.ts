import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsDto } from '../dtos/products.dto';
import { ProductWarehouseService } from '../services/product-warehouse.service';

@Controller('warehouses')
@ApiTags('Products')
export class ProductWarehouseController {
  constructor(
    private readonly productWarehouseService: ProductWarehouseService,
  ) {}

  @Get(':warehouseId/products')
  @ApiOperation({ summary: 'Get all products from a warehouse' })
  async findProductsByWarehouseId(
    @Param('warehouseId') warehouseId: number,
  ): Promise<{ message: string; status: string; data: ProductsDto[] }> {
    const results =
      await this.productWarehouseService.findProductsByWarehouseId(warehouseId);
    if (!results) {
      throw new NotFoundException(
        `No products found for warehouse with id ${warehouseId}`,
      );
    }
    return {
      status: 'success',
      message: 'All products for the warehouse fetched successfully',
      ...results,
    };
  }

  @Get(':warehouseId/category/:categoryId/products')
  @ApiOperation({
    summary: 'Get all products of a warehouse from a specific category',
  })
  async findProductsByWarehouseAndCategory(
    @Param('warehouseId') warehouseId: number,
    @Param('categoryId') categoryId: number
  ): Promise<{ message: string; status: string; data: any[] }> {
    const results =
      await this.productWarehouseService.findProductsByWarehouseAndCategory(
        warehouseId,
        categoryId,
      );
    return {
      status: 'success',
      message: 'Products fetched successfully',
      ...results,
    };
  }
}

import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
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
    @Query() query: any,
  ): Promise<{ message: string; status: string; data: ProductsDto[] }> {
    const page = query.page || 1;
    const perPage = query.perPage || 10;
    const results =
      await this.productWarehouseService.findProductsByWarehouseId(
        warehouseId,
        {
          page,
          perPage,
        },
      );
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
    @Param('categoryId') categoryId: number,
    @Query() query: any,
  ): Promise<{ message: string; status: string; data: any[] }> {
    const page = query.page || 1;
    const perPage = query.perPage || 10;
    const results =
      await this.productWarehouseService.findProductsByWarehouseAndCategory(
        warehouseId,
        categoryId,
        {
          page,
          perPage,
        },
      );
    return {
      status: 'success',
      message: 'Products fetched successfully',
      ...results,
    };
  }
}

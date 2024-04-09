import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductWarehouseService } from '../services/product-warehouse.service';
import { ProductsDto } from '../dtos/products.dto';

@Controller('warehouses/:warehouseId/products')
@ApiTags('Products')
export class ProductWarehouseController {
  constructor(
    private readonly productWarehouseService: ProductWarehouseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products from a warehouse' })
  async findProductsByWarehouseId(
    @Param('warehouseId') warehouseId: number,
  ): Promise<{ message: string; status: string; data: ProductsDto[] }> {
    const products =
      await this.productWarehouseService.findProductsByWarehouseId(warehouseId);
    if (!products) {
      throw new NotFoundException(
        `No products found for warehouse with id ${warehouseId}`,
      );
    }
    return {
      message: 'All products for the warehouse fetched successfully',
      status: 'success',
      data: products,
    };
  }
}

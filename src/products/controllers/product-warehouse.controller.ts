import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductWarehouseService } from '../services/product-warehouse.service';
import { ProductsDto } from '../dtos/products.dto';

@Controller('warehouses/:warehouseId/products')
export class ProductWarehouseController {
  constructor(
    private readonly productWarehouseService: ProductWarehouseService,
  ) {}

  @Get()
  async findProductsByWarehouseId(
    @Param('warehouseId') warehouseId: number,
  ): Promise<ProductsDto[]> {
    const products =
      await this.productWarehouseService.findProductsByWarehouseId(warehouseId);
    if (!products) {
      throw new NotFoundException(
        `No products found for warehouse with id ${warehouseId}`,
      );
    }
    return products;
  }
}

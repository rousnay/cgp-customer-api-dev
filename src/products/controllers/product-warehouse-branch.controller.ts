import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductWarehouseBranchService } from '../services/product-warehouse-branch.service';
import { ProductsDto } from '../dtos/products.dto';

@Controller('warehouse-branches/:branchId/products')
export class ProductWarehouseBranchController {
  constructor(
    private readonly productWarehouseBranchService: ProductWarehouseBranchService,
  ) {}

  @Get()
  async findProductsByBranchId(
    @Param('branchId') branchId: number,
  ): Promise<ProductsDto[]> {
    const products =
      await this.productWarehouseBranchService.findProductsByBranchId(branchId);
    if (!products) {
      throw new NotFoundException(
        `No products found for warehouse branch with id ${branchId}`,
      );
    }
    return products;
  }
}

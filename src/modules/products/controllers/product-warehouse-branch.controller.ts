import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsDto } from '../dtos/products.dto';
import { ProductWarehouseBranchService } from '../services/product-warehouse-branch.service';

@Controller('warehouse/branches/:branchId/products')
@ApiTags('Products')
export class ProductWarehouseBranchController {
  constructor(
    private readonly productWarehouseBranchService: ProductWarehouseBranchService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products from a warehouse branch' })
  async findProductsByBranchId(
    @Param('branchId') branchId: number,
  ): Promise<{ message: string; status: string; data: ProductsDto[] }> {
    const results =
      await this.productWarehouseBranchService.findProductsByBranchId(branchId);
    if (!results) {
      throw new NotFoundException(
        `No products found for warehouse branch with id ${branchId}`,
      );
    }
    return {
      status: 'success',
      message: 'All products for the warehouse branch fetched successfully',
      ...results,
    };
  }
}

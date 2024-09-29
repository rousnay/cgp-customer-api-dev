import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsDto } from '../dtos/products.dto';
import { ProductCategoryService } from '../services/product-category.service';

@Controller('categories/:categoryId/products')
@ApiTags('Products')
export class ProductCategoryController {
  constructor(
    private readonly categoryProductService: ProductCategoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products from a category' })
  async findProductsByCategoryId(
    @Param('categoryId') categoryId: number,
    @Query('page') page: any,
    @Query('perPage') perPage: any,
  ): Promise<{ message: string; status: string; data: ProductsDto[] }> {
    let results = null;
    if (page) {
      if (!perPage) {
        perPage = 5;
      }
      results = await this.categoryProductService.findProductsByCategoryIdPage(
        categoryId,
        page,
        perPage,
      );
    } else {
      results = await this.categoryProductService.findProductsByCategoryId(
        categoryId,
      );
    }
    if (!results || results.length === 0) {
      throw new NotFoundException(
        `No products found for category with id ${categoryId}`,
      );
    }
    return {
      message: 'All products for the category fetched successfully',
      status: 'success',
      ...results,
    };
  }
}

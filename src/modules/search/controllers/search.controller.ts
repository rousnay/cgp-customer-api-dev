import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { SearchProductsService } from '../services/search-products.service';
import { SearchWarehouseBranchesService } from '../services/search-warehouse-branches.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchProductsService: SearchProductsService,
    private readonly searchWarehouseBranchesService: SearchWarehouseBranchesService,
  ) {}

  @Get('products')
  @ApiOperation({
    summary: 'Search products by name, category, brand or warehouse',
  })
  @ApiQuery({ name: 'query', type: String, required: false })
  @ApiQuery({ name: 'brand', type: String, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'warehouse', type: String, required: false })
  @ApiQuery({ name: 'brandId', type: Number, required: false })
  @ApiQuery({ name: 'categoryId', type: Number, required: false })
  @ApiQuery({ name: 'warehouseId', type: Number, required: false })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    enum: ['recent', 'older', 'name', 'price_high', 'price_low'],
  })
  @ApiQuery({ name: 'priceMin', type: Number, required: false })
  @ApiQuery({ name: 'priceMax', type: Number, required: false })
  // @ApiQuery({ name: 'currentPage', type: Number, required: false })
  // @ApiQuery({ name: 'limit', type: Number, required: false })
  async searchProducts(
    @Query('query') query: string,
    @Query('brand') brand: string,
    @Query('category') category: string,
    @Query('warehouse') warehouse: string,
    @Query('brandId') brandId: number,
    @Query('categoryId') categoryId: number,
    @Query('warehouseId') warehouseId: number,
    @Query('sort') sort: string,
    @Query('priceMin') priceMin: number,
    @Query('priceMax') priceMax: number,
    // @Query('currentPage') currentPage: number,
    // @Query('limit') limit: number,
  ) {
    const products = await this.searchProductsService.searchProducts(
      query,
      brand,
      category,
      warehouse,
      brandId,
      categoryId,
      warehouseId,
      sort,
      priceMin,
      priceMax,
      // currentPage,
      // limit,
    );

    if (!products || products.length === 0) {
      throw new NotFoundException(
        `No products found for your search query: ${query}`,
      );
    }
    return {
      message: 'All products based on your search query fetched successfully',
      status: 'success',
      ...products,
    };
  }

  @Get('warehouses')
  @ApiOperation({
    summary: 'Search warehouses by name, category, or product.',
  })
  @ApiQuery({ name: 'query', type: String, required: false })
  async searchWarehouses(@Query('query') query: string) {
    const results =
      await this.searchWarehouseBranchesService.searchWarehouseBranches(query);

    if (!results || results.length === 0) {
      throw new NotFoundException(
        `No results found for your search query: ${query}`,
      );
    }
    return {
      message: 'Search results fetched successfully',
      status: 'success',
      ...results,
    };
  }
}

import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchProductsService } from '../services/search-products.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchProductsService: SearchProductsService) {}

  @Get('products')
  @ApiOperation({ summary: 'Search products' })
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
  @ApiQuery({ name: 'currentPage', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
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
    @Query('currentPage') currentPage: number,
    @Query('limit') limit: number,
  ) {
    return this.searchProductsService.searchProducts(
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
      currentPage,
      limit,
    );
  }
}

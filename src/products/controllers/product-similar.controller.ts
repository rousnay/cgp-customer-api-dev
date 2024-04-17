import { Controller, Get, Param } from '@nestjs/common';
import { SimilarProductsService } from '../services/product-similar.service';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('products')
export class SimilarProductsController {
  constructor(
    private readonly similarProductsService: SimilarProductsService,
  ) {}

  @Get('similar/:productId')
  @ApiParam({ name: 'productId', type: Number, required: false })
  async getSimilarProducts(@Param('productId') productId: number) {
    const similarProducts =
      await this.similarProductsService.getSimilarProducts(productId);
    return similarProducts;
  }
}

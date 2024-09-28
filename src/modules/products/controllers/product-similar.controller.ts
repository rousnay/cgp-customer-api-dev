import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SimilarProductsService } from '../services/product-similar.service';

@ApiTags('Products')
@Controller('products')
export class SimilarProductsController {
  constructor(
    private readonly similarProductsService: SimilarProductsService,
  ) {}

  @Get('similar/:productId')
  @ApiParam({ name: 'productId', type: Number, required: false })
  async getSimilarProducts(
    @Param('productId') productId: number,
    @Query() query: any,
  ) {
    const page = query.page || 1;
    const perPage = query.perPage || 10;
    const results = await this.similarProductsService.getSimilarProducts(
      productId,
      {
        page,
        perPage,
      },
    );

    if (!results || results.length === 0) {
      throw new NotFoundException(
        `No similar products found for product with id ${productId}`,
      );
    }
    return {
      message: 'All similar products fetched successfully',
      status: 'success',
      ...results,
    };
  }
}

import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductCategoryService } from '../services/product-category.service';
import { ProductsDto } from '../dtos/products.dto';

@Controller('categories/:categoryId/products')
export class ProductCategoryController {
  constructor(
    private readonly categoryProductService: ProductCategoryService,
  ) {}

  @Get()
  async findProductsByCategoryId(
    @Param('categoryId') categoryId: number,
  ): Promise<ProductsDto[]> {
    const products = await this.categoryProductService.findProductsByCategoryId(
      categoryId,
    );
    if (!products) {
      throw new NotFoundException(
        `No products found for category with id ${categoryId}`,
      );
    }
    return products;
  }
}

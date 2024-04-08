import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsDto } from './products.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  async findAll(): Promise<ProductsDto[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ProductsDto> {
    const product = await this.productService.findOne(id);
    if (product === undefined || product === null) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }
}

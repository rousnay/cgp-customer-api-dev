import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsDto } from '../dtos/products.dto';
import { ProductsService } from '../services/products.service';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
    content: {
      'application/json': {
        example: {
          message: 'Product list fetched successfully',
          status: 'success',
          data: [
            {
              id: '1',
              name: 'test',
              slug: 'test',
              barcode: null,
              product_type_id: null,
              category_id: '2',
              primary_category_id: '19',
              brand_id: '3',
              unit_type_id: null,
              unit: null,
              size_id: null,
              colour_id: null,
              group_id: null,
              weight: null,
              short_desc: 'rasd asd adca d',
              long_desc: 'asd  asdfa asd',
              details_overview: null,
              details_specifications: null,
              details_size_and_materials: null,
              status_id: null,
              active: 1,
              creator_id: '2',
              editor_id: null,
              created_at: '2024-04-08T09:27:33.000Z',
              updated_at: '2024-04-08T09:27:33.000Z',
              deleted_at: null,
            },
            {
              id: '2',
              name: 'test 3',
              slug: 'test-3',
              barcode: null,
              product_type_id: null,
              category_id: '1',
              primary_category_id: '16',
              brand_id: '5',
              unit_type_id: null,
              unit: null,
              size_id: null,
              colour_id: null,
              group_id: null,
              weight: null,
              short_desc: 'wsdqasd',
              long_desc:
                'sda asdas \n asd\nasd\n\n\nasd sdasda\nasd\nasd asd\n\n\nasd asda\n\nasd\nasd',
              details_overview: null,
              details_specifications: null,
              details_size_and_materials: null,
              status_id: null,
              active: 1,
              creator_id: '2',
              editor_id: null,
              created_at: '2024-04-08T03:30:15.000Z',
              updated_at: '2024-04-08T03:30:15.000Z',
              deleted_at: null,
            },
          ],
        },
      },
    },
  })
  async findAll(@Query() queryParams: any): Promise<{
    message: string;
    status: string;
    // data: ProductsDto[];
  }> {
    const page = queryParams.page || 1;
    const perPage = queryParams.perPage || 10;
    const results = await this.productService.findAll({
      page,
      perPage,
    });
    if (results === undefined || results === null) {
      throw new NotFoundException(`No product has found`);
    }

    return {
      status: 'success',
      message: 'Product list fetched successfully',
      ...results,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the product by id' })
  @ApiResponse({
    status: 200,
    description: 'Single product by id specified',
    content: {
      'application/json': {
        example: {
          message: 'Product fetched successfully',
          status: 'success',
          data: {
            id: '1',
            name: 'test',
            slug: 'test',
            barcode: null,
            product_type_id: null,
            category_id: '2',
            primary_category_id: '19',
            brand_id: '3',
            unit_type_id: null,
            unit: null,
            size_id: null,
            colour_id: null,
            group_id: null,
            weight: null,
            short_desc: 'rasd asd adca d',
            long_desc: 'asd  asdfa asd',
            details_overview: null,
            details_specifications: null,
            details_size_and_materials: null,
            status_id: null,
            active: 1,
            creator_id: '2',
            editor_id: null,
            created_at: '2024-04-08T09:27:33.000Z',
            updated_at: '2024-04-08T09:27:33.000Z',
            deleted_at: null,
          },
        },
      },
    },
  })
  async findOne(
    @Param('id') id: number,
  ): Promise<{ message: string; status: string; data: ProductsDto }> {
    const results = await this.productService.findOne(id);
    if (results === undefined || results === null) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return {
      status: 'success',
      message: 'Product with specified id fetched successfully',
      ...results,
    };
  }
}

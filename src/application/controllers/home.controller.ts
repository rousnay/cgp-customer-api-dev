import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WarehousesDto } from '../../warehouse/dtos/warehouses.dto';
import { WarehousesService } from '../../warehouse/services/warehouses.service';
import { ProductsDto } from '../../products/dtos/products.dto';
import { ProductsService } from '../../products/services/products.service';
import { CategoriesDto } from '../dtos/categories.dto';
import { CategoriesService } from '../services/categories.service';

@Controller('home')
@ApiTags('Application')
export class HomeController {
  constructor(
    private readonly warehouseService: WarehousesService,
    private readonly productService: ProductsService,
    private readonly categoryService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get data for home page' })
  @ApiResponse({
    status: 200,
    description: 'All data related to home page',
    content: {
      'application/json': {
        example: {
          message: 'Data for home page fetched successfully',
          status: 'success',
          categories: [
            {
              id: '1',
              name: 'Structural Materials',
              slug: 'structural-materials',
              parent_id: null,
              grand_parent_id: null,
              serial: null,
              active: 1,
              created_at: null,
              updated_at: null,
            },
            {
              id: '2',
              name: 'Electrical',
              slug: 'electrical',
              parent_id: null,
              grand_parent_id: null,
              serial: null,
              active: 1,
              created_at: null,
              updated_at: null,
            },
          ],
          warehouses: [
            {
              id: '1',
              name: 'test warehouse',
              abn_number: 'W666',
              active: 1,
              created_at: '2024-04-03T23:21:00.000Z',
              updated_at: '2024-04-03T23:21:00.000Z',
            },
            {
              id: '2',
              name: 'test warehouse 2',
              abn_number: 'W666',
              active: 1,
              created_at: '2024-04-03T23:21:00.000Z',
              updated_at: '2024-04-03T23:21:00.000Z',
            },
          ],
          products: [
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
              created_at: '2024-04-08T03:27:33.000Z',
              updated_at: '2024-04-08T03:27:33.000Z',
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
  async getHomePageData(): Promise<{
    message: string;
    status: string;
    categories: CategoriesDto[];
    warehouses: WarehousesDto[];
    products: ProductsDto[];
  }> {
    const categories = await this.categoryService.findAll();
    const warehouses = await this.warehouseService.findAll();
    const products = await this.productService.findAll();
    return {
      message: 'Home data fetched successfully',
      status: 'success',
      categories,
      warehouses,
      products,
    };
  }
}

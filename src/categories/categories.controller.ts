import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoriesDto } from './categories.dto';

@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all categories' })
  @ApiResponse({
    status: 200,
    description: 'Get the list of product categories',
    content: {
      'application/json': {
        example: {
          message: 'Categories list fetched successfully',
          status: 'success',
          data: [
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
              name: 'Finishing Materials',
              slug: 'finishing-materials',
              parent_id: null,
              grand_parent_id: null,
              serial: null,
              active: 1,
              created_at: null,
              updated_at: null,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No categories found' })
  async findAll(): Promise<{
    message: string;
    status: string;
    data: CategoriesDto[];
  }> {
    return {
      message: 'Categories list fetched successfully',
      status: 'success',
      data: await this.categoryService.findAll(),
    };
  }
}

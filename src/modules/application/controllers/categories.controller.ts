import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

import { CategoriesService } from '../services/categories.service';
import { CategoriesDto } from '../dtos/categories.dto';

@Controller('categories')
@ApiTags('Application')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all categories' })
  @ApiResponse({
    status: 200,
    description: 'Get the list of all categories',
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
              product_count: '0',
            },
            {
              id: '2',
              name: 'Finishing Materials',
              slug: 'finishing-materials',
              parent_id: null,
              grand_parent_id: null,
              serial: null,
              active: 1,
              product_count: '0',
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
      data: await this.categoryService.findAllWithProductCount(),
    };
  }

  @Get(':parentId/subcategories')
  @ApiOperation({ summary: 'Get list of all subcategories by parent id' })
  @ApiResponse({
    status: 200,
    description: 'Get the list of subcategories by parent id',
    content: {
      'application/json': {
        example: {
          message: 'Subcategories fetched successfully',
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
              product_count: '0',
            },
            {
              id: '2',
              name: 'Finishing Materials',
              slug: 'finishing-materials',
              parent_id: null,
              grand_parent_id: null,
              serial: null,
              active: 1,
              product_count: '0',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No subcategories found' })
  async getSubcategories(@Param('parentId') parentId: string): Promise<{
    message: string;
    status: string;
    data: CategoriesDto[];
  }> {
    const subcategories =
      await this.categoryService.findSubcategoriesWithProductCountByParentId(
        parseInt(parentId, 10),
      );

    return {
      message: 'Subcategories fetched successfully',
      status: 'success',
      data: subcategories,
    };
  }
}

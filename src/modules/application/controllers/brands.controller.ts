import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

import { BrandsService } from '../services/brands.service';
import { BrandsDto } from '../dtos/brands.dto';

@Controller('brands')
@ApiTags('Application')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all brands' })
  @ApiResponse({
    status: 200,
    description: 'Get the list of all brands',
    content: {
      'application/json': {
        example: {
          message: 'Brand list fetched successfully',
          status: 'success',
          data: [
            {
              id: '1',
              name: 'LafargeHolcim',
              slug: 'lafarge-holcim',
              media_id: null,
              creator_id: '1',
              editor_id: null,
              active: 1,
            },
            {
              id: '2',
              name: 'Saint-Gobain',
              slug: 'saint-gobain',
              media_id: null,
              creator_id: '1',
              editor_id: null,
              active: 1,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No brands found' })
  async findAll(): Promise<{
    message: string;
    status: string;
    data: BrandsDto[];
  }> {
    return {
      message: 'Brand list fetched successfully',
      status: 'success',
      data: await this.brandsService.findAll(),
    };
  }
}

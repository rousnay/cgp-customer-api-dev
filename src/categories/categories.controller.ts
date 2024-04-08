import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesDto } from './categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Get()
  async findAll(): Promise<CategoriesDto[]> {
    return this.categoryService.findAll();
  }
}

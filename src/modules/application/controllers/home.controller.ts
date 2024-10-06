import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WarehousesDto } from '@modules/warehouse/dtos/warehouses.dto';
import { WarehousesService } from '@modules/warehouse/services/warehouses.service';
import { ProductsDto } from '@modules/products/dtos/products.dto';
import { ProductsService } from '@modules/products/services/products.service';
import { WarehouseCategoryService } from '@modules/warehouse/services/warehouse-category.services';
import { ProductCategoryService } from '@modules/products/services/product-category.service';
import { CategoriesDto } from '../dtos/categories.dto';
import { CategoriesService } from '../services/categories.service';
import { WarehouseBranchService } from '@modules/warehouse/services/warehouse-branch.service';

@Controller('home')
@ApiTags('Application')
export class HomeController {
  constructor(
    private readonly warehouseService: WarehousesService,
    private readonly warehouseBranchService: WarehouseBranchService,
    private readonly productService: ProductsService,
    private readonly categoryService: CategoriesService,
    private readonly warehouseCategoryService: WarehouseCategoryService,
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get data for home page' })
  async getHomePageData(): Promise<{
    message: string;
    status: string;
    categories: CategoriesDto[];
    warehouses: WarehousesDto[];
    products: ProductsDto[];
  }> {
    const categories = await this.categoryService.findAllWithProductCount();
    const warehouses = await this.warehouseService.findAll({
      forHome: true,
    });
    const products = await this.productService.findAll(10);
    return {
      message: 'Home data fetched successfully',
      status: 'success',
      categories,
      warehouses: warehouses.data,
      products: products.data,
    };
  }

  @Get('with-branch')
  @ApiOperation({ summary: 'Get data for home page' })
  async getHomePageData_with_branch(): Promise<{
    message: string;
    status: string;
    categories: CategoriesDto[];
    warehouseBranches: any[];
    products: ProductsDto[];
  }> {
    const categories = await this.categoryService.findAllWithProductCount();
    const warehouseBranches = await this.warehouseBranchService.findAll({
      page: 1,
      perPage: 10,
    });
    const products = await this.productService.findAll();
    return {
      message: 'Home data fetched successfully',
      status: 'success',
      categories,
      warehouseBranches: warehouseBranches.data,
      products: products.data,
    };
  }

  @Get('filter')
  @ApiOperation({ summary: 'Get data for home page from a category' })
  async getHomePageDataByCategoryId(
    @Query('categoryId') categoryId: number,
  ): Promise<{
    message: string;
    status: string;
    category: CategoriesDto[];
    warehouses: any;
    products: any;
  }> {
    const warehouses =
      await this.warehouseCategoryService.findWarehousesByCategoryId(
        categoryId,
      );
    const products = await this.productCategoryService.findProductsByCategoryId(
      categoryId,
    );
    return {
      message: 'Home data fetched successfully',
      status: 'success',
      category: warehouses.category,
      warehouses: warehouses.warehouses,
      products: products.products,
    };
  }
}

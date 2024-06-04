import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { ProductWarehouseService } from './services/product-warehouse.service';
import { ProductWarehouseController } from './controllers/product-warehouse.controller';
import { ProductWarehouseBranchService } from './services/product-warehouse-branch.service';
import { ProductWarehouseBranchController } from './controllers/product-warehouse-branch.controller';
import { ProductCategoryService } from './services/product-category.service';
import { ProductCategoryController } from './controllers/product-category.controller';
import { SimilarProductsService } from './services/product-similar.service';
import { SimilarProductsController } from './controllers/product-similar.controller';

@Module({
  imports: [TypeOrmModule.forFeature()],
  providers: [
    ProductsService,
    ProductWarehouseService,
    ProductWarehouseBranchService,
    ProductCategoryService,
    SimilarProductsService,
  ],
  controllers: [
    ProductsController,
    ProductWarehouseController,
    ProductWarehouseBranchController,
    ProductCategoryController,
    SimilarProductsController,
  ],
})
export class ProductsModule {}

import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WarehousesService } from '@modules/warehouse/services/warehouses.service';
import { WarehouseModule } from '@modules/warehouse/warehouses.module';
import { ProductsService } from '@modules/products/services/products.service';
import { ProductsModule } from '@modules/products/products.module';
import { CategoriesService } from '@modules/application/services/categories.service';
import { WarehouseCategoryService } from '@modules/warehouse/services/warehouse-category.services';
import { ProductCategoryService } from '@modules/products/services/product-category.service';
import { CategoriesController } from './controllers/categories.controller';
import { Preferences } from './entities/preferences.entity';
import { PreferencesService } from './services/preferences.service';
import { BrandsController } from './controllers/brands.controller';
import { BrandsService } from './services/brands.service';
import { PreferencesController } from './controllers/preferences.controller';
import { HomeController } from './controllers/home.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Preferences]),
    WarehouseModule,
    ProductsModule,
  ],
  exports: [
    WarehousesService,
    ProductsService,
    BrandsService,
    WarehouseCategoryService,
    ProductCategoryService,
    CategoriesService,
    PreferencesService,
  ],
  providers: [
    WarehousesService,
    ProductsService,
    BrandsService,
    WarehouseCategoryService,
    ProductCategoryService,
    CategoriesService,
    PreferencesService,
  ],
  controllers: [
    HomeController,
    BrandsController,
    CategoriesController,
    PreferencesController,
  ],
})
export class ApplicationModule implements OnModuleInit {
  constructor(private readonly preferenceService: PreferencesService) {}

  async onModuleInit() {
    await this.preferenceService.createInitialOptions();
  }
}

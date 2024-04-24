import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesService } from 'src/warehouse/services/warehouses.service';
import { WarehouseModule } from 'src/warehouse/warehouses.module';
import { ProductsService } from 'src/products/services/products.service';
import { ProductsModule } from 'src/products/products.module';
import { HomeController } from './controllers/home.controller';
import { CategoriesService } from 'src/application/services/categories.service';
import { CategoriesController } from './controllers/categories.controller';
import { Preferences } from './entities/preferences.entity';
import { PreferencesService } from './services/preferences.service';
import { PreferencesController } from './controllers/preferences.controller';
import { WarehouseCategoryService } from 'src/warehouse/services/warehouse-category.services';
import { ProductCategoryService } from 'src/products/services/product-category.service';
import { BrandsController } from './controllers/brands.controller';
import { BrandsService } from './services/brands.service';

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

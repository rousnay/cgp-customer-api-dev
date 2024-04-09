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

@Module({
  imports: [
    TypeOrmModule.forFeature([Preferences]),
    WarehouseModule,
    ProductsModule,
  ],
  exports: [
    PreferencesService,
    CategoriesService,
    WarehousesService,
    ProductsService,
  ],
  providers: [
    CategoriesService,
    PreferencesService,
    WarehousesService,
    ProductsService,
  ],
  controllers: [HomeController, CategoriesController, PreferencesController],
})
export class ApplicationModule implements OnModuleInit {
  constructor(private readonly preferenceService: PreferencesService) {}

  async onModuleInit() {
    await this.preferenceService.createInitialOptions();
  }
}

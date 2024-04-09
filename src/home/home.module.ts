import { Module } from '@nestjs/common';
import { WarehousesService } from 'src/warehouse/services/warehouses.service';
import { WarehouseModule } from 'src/warehouse/warehouses.module';
import { ProductsService } from 'src/products/services/products.service';
import { ProductsModule } from 'src/products/products.module';
import { HomeController } from './home.controller';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [WarehouseModule, ProductsModule, CategoriesModule],
  providers: [WarehousesService, ProductsService, CategoriesService],
  controllers: [HomeController],
})
export class HomeModule {}

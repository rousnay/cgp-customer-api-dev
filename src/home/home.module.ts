// home.module.ts

import { Module } from '@nestjs/common';
import { WarehousesService } from 'src/warehouse/services/warehouses.service';
import { WarehouseModule } from 'src/warehouse/warehouses.module';
import { ProductsService } from 'src/products/services/products.service';
import { ProductsModule } from 'src/products/products.module';
import { HomeController } from './home.controller';

@Module({
  imports: [WarehouseModule, ProductsModule], // Import ProductModule and WarehouseModule
  controllers: [HomeController],
  providers: [WarehousesService, ProductsService],
})
export class HomeModule {}

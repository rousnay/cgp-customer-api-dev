// warehouse.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';

@Module({
  imports: [TypeOrmModule.forFeature()],
  controllers: [WarehousesController],
  providers: [WarehousesService],
})
export class WarehouseModule {}

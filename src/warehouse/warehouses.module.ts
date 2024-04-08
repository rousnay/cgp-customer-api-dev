// warehouse.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesService } from './services/warehouses.service';
import { WarehousesController } from './controllers/warehouses.controller';
import { WarehouseBranchService } from './services/warehouse-branch.service';
import { WarehouseBranchController } from './controllers/warehouse-branch.controller';

@Module({
  imports: [TypeOrmModule.forFeature()],
  providers: [WarehousesService, WarehouseBranchService],
  controllers: [WarehousesController, WarehouseBranchController],
})
export class WarehouseModule {}

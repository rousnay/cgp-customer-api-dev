import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WarehousesService } from './services/warehouses.service';
import { WarehousesController } from './controllers/warehouses.controller';
import { WarehouseBranchService } from './services/warehouse-branch.service';
import { WarehouseBranchController } from './controllers/warehouse-branch.controller';
import { WarehouseCategoryService } from './services/warehouse-category.services';
import { WarehouseCategoryController } from './controllers/warehouse-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature()],
  providers: [
    WarehousesService,
    WarehouseBranchService,
    WarehouseCategoryService,
  ],
  controllers: [
    WarehousesController,
    WarehouseBranchController,
    WarehouseCategoryController,
  ],
})
export class WarehouseModule {}

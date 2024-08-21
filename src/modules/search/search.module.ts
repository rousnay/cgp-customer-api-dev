import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchProductsService } from './services/search-products.service';
import { SearchController } from './controllers/search.controller';
import { ConfigModule } from '@config/config.module';
import { SearchWarehouseBranchesService } from './services/search-warehouse-branches.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature()],
  providers: [SearchProductsService, SearchWarehouseBranchesService],
  controllers: [SearchController],
})
export class SearchModule {}

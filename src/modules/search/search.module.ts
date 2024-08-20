import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchProductService } from './services/search-product.service';
import { SearchController } from './controllers/search.controller';
import { ConfigModule } from '@config/config.module';
import { SearchWarehouseService } from './services/search-warehouse.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature()],
  providers: [SearchProductService, SearchWarehouseService],
  controllers: [SearchController],
})
export class SearchModule {}

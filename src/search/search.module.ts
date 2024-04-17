import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchProductsService } from './services/search-products.service';
import { SearchController } from './controllers/search.controller';

@Module({
  imports: [TypeOrmModule.forFeature()],
  providers: [SearchProductsService],
  controllers: [SearchController],
})
export class SearchModule {}

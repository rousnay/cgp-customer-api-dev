import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from '@modules/products/services/products.service';
import { WishList } from './wishlist.entity';
import { WishListService } from './wishlist.service';
import { WishListController } from './wishlist.controller';
import { ConfigModule } from '@config/config.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([WishList])],
  controllers: [WishListController],
  providers: [WishListService, ProductsService],
})
export class WishListModule {}

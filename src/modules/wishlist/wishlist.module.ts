import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishList } from './wishlist.entity';
import { WishListController } from './wishlist.controller';
import { WishListService } from './wishlist.service';
import { ProductsService } from '../products/services/products.service';

@Module({
  imports: [TypeOrmModule.forFeature([WishList])],
  controllers: [WishListController],
  providers: [WishListService, ProductsService],
})
export class WishListModule {}

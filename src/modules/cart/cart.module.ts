import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from '@modules/products/services/products.service';
import { Cart } from './cart.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ConfigModule } from '@config/config.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Cart])],
  controllers: [CartController],
  providers: [CartService, ProductsService],
})
export class CartModule {}

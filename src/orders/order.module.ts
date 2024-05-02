import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/orders.entity';
import { OrderDetails } from './entities/order_details.entity';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
// import { CartRepository } from 'src/cart/cart.repository';
import { Cart } from 'src/cart/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orders, OrderDetails, Cart])],
  exports: [OrderService],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

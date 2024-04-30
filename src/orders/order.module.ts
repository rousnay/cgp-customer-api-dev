import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/order_detail.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
// import { CartRepository } from 'src/cart/cart.repository';
import { Cart } from 'src/cart/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail, Cart])],
  exports: [OrderService],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async placeOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const order = await this.orderService.placeOrder(createOrderDto);
      return order;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':orderId')
  async cancelOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<void> {
    try {
      await this.orderService.cancelOrder(orderId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found');
      }
      throw error;
    }
  }

  @Delete(':orderId')
  async deleteOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<void> {
    try {
      await this.orderService.deleteOrder(orderId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found');
      }
      throw error;
    }
  }

  @Get(':orderId')
  async getOrderById(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Order> {
    try {
      const order = await this.orderService.getOrderById(orderId);
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found');
      }
      throw error;
    }
  }

  @Get('history/:customerId')
  async getOrderHistory(
    @Param('customerId', ParseIntPipe) customerId: number,
  ): Promise<Order[]> {
    return this.orderService.getOrderHistory(customerId);
  }
}

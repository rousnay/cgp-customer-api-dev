import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Place an order' })
  @ApiBody({ type: CreateOrderDto })
  async placeOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const order = await this.orderService.placeOrder(createOrderDto);
      return order;
    } catch (error) {
      throw error;
    }
  }

  @Put(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Cancel an order' })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Delete an order' })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get an order' })
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

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get order history' })
  async getOrderHistory(): Promise<Order[]> {
    return this.orderService.getOrderHistory();
  }
}

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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { OrderService } from '../services/orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Orders } from '../entities/orders.entity';

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Place an order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiQuery({
    name: 'payment_client',
    type: 'string',
    required: true,
    description: 'Payment client type',
    enum: ['web', 'app'],
  })
  async placeOrder(
    @Query('payment_client') payment_client: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{
    status: string;
    message: string;
    data: Orders;
  }> {
    try {
      const order = await this.orderService.placeOrder(
        payment_client,
        createOrderDto,
      );
      return {
        status: 'success',
        message: 'Order placed successfully',
        data: order,
      };
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

  @Get('single/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get an order' })
  async getOrderById(@Param('orderId', ParseIntPipe) orderId: number): Promise<{
    status: string;
    message: string;
    data: any;
  }> {
    try {
      const order = await this.orderService.getOrderById(orderId);
      return {
        status: 'success',
        message: 'Order has been fetched successfully',
        data: order,
      };
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
  async getOrderHistory(): Promise<{
    status: string;
    message: string;
    data: any;
  }> {
    const orders = await this.orderService.getOrderHistory();
    return {
      status: 'success',
      message: 'Order has been fetched successfully',
      data: orders,
    };
  }
}

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
import { OngoingOrder } from '../schemas/ongoing-order.schema';

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Place an order' })
  @ApiBody({ type: CreateOrderDto })
  async placeOrder(@Body() createOrderDto: CreateOrderDto): Promise<{
    status: string;
    message: string;
    data: Orders;
  }> {
    try {
      const order = await this.orderService.placeOrder(createOrderDto);
      return {
        status: 'success',
        message: 'Order placed successfully',
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  @Put('/cancel/:orderId/:orderCancelReasonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('orderCancelReasonId', ParseIntPipe) orderCancelReasonId: number,
  ): Promise<any> {
    console.log('orderCancelReasonId', orderCancelReasonId);
    console.log('orderId', orderId);
    try {
      const order_id = await this.orderService.cancelOrder(
        orderId,
        orderCancelReasonId,
      );
      return {
        status: 'success',
        message: 'Order has been cancelled successfully',
        data: { id: order_id },
      };
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

  @Get('ongoing-order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get the ongoing order by id' })
  async getOngoingOrderByOrderId(
    @Param('orderId') orderId: number,
  ): Promise<{ status: string; message: string; data: OngoingOrder }> {
    const order = await this.orderService.getOngoingOrderByOrderId(orderId);

    return {
      status: 'success',
      message: 'Ongoing order has been fetched successfully',
      data: order,
    };
  }
}

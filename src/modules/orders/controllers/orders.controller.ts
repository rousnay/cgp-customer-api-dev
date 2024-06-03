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
import { OrderService } from '../services/orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Orders } from '../entities/orders.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Place an order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'All data related to set password',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message: 'Order placed successfully',
          data: {
            customer_id: 6,
            warehouse_id: 0,
            delivery_id: 0,
            shipping_address_id: 0,
            billing_address_id: 0,
            payment_id: 0,
            total_price: 0,
            discount: 0,
            vat: 0,
            payable_amount: 0,
            created_at: '2024-04-30T01:02:20.657Z',
            updated_at: '2024-04-30T01:02:20.657Z',
            id: 13,
            order_status: 'pending',
            line_items: [
              {
                order_id: 13,
                product_id: 1,
                product_quantity: 0,
                regular_price: 0,
                sales_price: 0,
                offer_id: 0,
                variant_id: null,
                created_at: '2024-04-30T01:02:20.882Z',
                updated_at: '2024-04-30T01:02:20.882Z',
                id: 19,
              },
              {
                order_id: 13,
                product_id: 2,
                product_quantity: 0,
                regular_price: 0,
                sales_price: 0,
                offer_id: 0,
                variant_id: null,
                created_at: '2024-04-30T01:02:20.999Z',
                updated_at: '2024-04-30T01:02:20.999Z',
                id: 20,
              },
            ],
          },
        },
      },
    },
  })
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
    const orders = this.orderService.getOrderHistory();
    return {
      status: 'success',
      message: 'Order has been fetched successfully',
      data: orders,
    };
  }
}

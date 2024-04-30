import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/order_detail.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
// import { CartService } from 'src/cart/cart.service';
import { Cart } from 'src/cart/cart.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    // private readonly cartService: CartService,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async placeOrder(createOrderDto: CreateOrderDto): Promise<any> {
    const customer_id = this.request['user'].id;
    const newOrder = this.orderRepository.create({
      ...createOrderDto,
      customer_id,
    });
    const savedOrder = await this.orderRepository.save(newOrder);

    const orderDetails = createOrderDto.products.map((product) => {
      const orderDetail = new OrderDetail();
      orderDetail.order_id = savedOrder.id;
      orderDetail.product_id = product.product_id;
      // orderDetail.variant_id = product.variant_id;
      orderDetail.product_quantity = product.quantity;
      orderDetail.regular_price = product.regular_price;
      orderDetail.sales_price = product.sales_price;
      orderDetail.offer_id = product.offer_id;
      return orderDetail;
    });

    const savedOrderDetails = await this.orderDetailRepository.save(
      orderDetails,
    );

    const productIdsToRemove = createOrderDto.products.map(
      (product) => product.product_id,
    );

    // Find and delete cart items for each product ID
    await Promise.all(
      productIdsToRemove.map(async (productId) => {
        await this.cartRepository.delete({
          product_id: productId,
          customer_id,
        });
      }),
    );

    return { ...savedOrder, line_items: savedOrderDetails };
  }

  async cancelOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer_id: this.request['user'].id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.remove(order);
  }

  async deleteOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer_id: this.request['user'].id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.remove(order);
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer_id: this.request['user'].id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getOrderHistory(): Promise<Order[]> {
    return this.orderRepository.find({
      where: { customer_id: this.request['user'].id },
    });
  }
}

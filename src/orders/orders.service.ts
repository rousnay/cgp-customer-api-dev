import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Orders } from './entities/orders.entity';
import { OrderDetails } from './entities/order_details.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
// import { CartService } from 'src/cart/cart.service';
import { Cart } from 'src/cart/cart.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
    @InjectRepository(OrderDetails)
    private readonly orderDetailRepository: Repository<OrderDetails>,
    // private readonly cartService: CartService,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async placeOrder(createOrderDto: CreateOrderDto): Promise<any> {
    const customer_id = this.request['user'].id;

    const total_price = createOrderDto.products.reduce((total, product) => {
      return total + product.regular_price;
    }, 0);

    const total_sales_price = createOrderDto.products.reduce(
      (total, product) => {
        return total + product.sales_price;
      },
      0,
    );

    const discount = total_price - total_sales_price;

    const vat = total_sales_price * 0.15;
    const delivery_charge = 0;

    const payable_amount = total_price - discount + vat + delivery_charge;

    const newOrder = this.orderRepository.create({
      ...createOrderDto,
      customer_id,
      total_price,
      discount,
      vat,
      delivery_charge,
      payable_amount,
    });
    const savedOrder = await this.orderRepository.save(newOrder);

    const orderDetails = createOrderDto.products.map((product) => {
      const orderDetail = new OrderDetails();
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

  // async getOrderById(orderId: number): Promise<Order> {
  //   const order = await this.orderRepository.findOne({
  //     where: { id: orderId, customer_id: this.request['user'].id },
  //   });

  //   if (!order) {
  //     throw new NotFoundException('Order not found');
  //   }
  //   return order;
  // }

  async getOrderById(orderId: number): Promise<any> {
    const userId = this.request['user'].id;
    const query = `
        SELECT
            o.*,
            w.name AS warehouse_name,
            shipping_cb.first_name AS shipping_first_name,
            shipping_cb.last_name AS shipping_last_name,
            shipping_cb.phone_number_1 AS shipping_phone_number_1,
            shipping_cb.phone_number_2 AS shipping_phone_number_2,
            shipping_cb.address AS shipping_address,
            shipping_cb.city AS shipping_city,
            shipping_cb.state AS shipping_state,
            shipping_cb.postal_code AS shipping_postal_code,
            shipping_cb.country_id AS shipping_country_id,
            shipping_cb.latitude AS shipping_latitude,
            shipping_cb.longitude AS shipping_longitude,
            shipping_cb.notes AS shipping_notes,

            billing_cb.first_name AS billing_first_name,
            billing_cb.last_name AS billing_last_name,
            billing_cb.phone_number_1 AS billing_phone_number_1,
            billing_cb.phone_number_2 AS billing_phone_number_2,
            billing_cb.address AS billing_address,
            billing_cb.city AS billing_city,
            billing_cb.state AS billing_state,
            billing_cb.postal_code AS billing_postal_code,
            billing_cb.country_id AS billing_country_id,
            billing_cb.latitude AS billing_latitude,
            billing_cb.longitude AS billing_longitude,
            billing_cb.notes AS billing_notes,
            o.total_price,

            pw.product_name,
            od.product_quantity,
            od.regular_price,
            od.sales_price,
            pw.active,
            pw.has_own_product_img,
            p.unit,
            p.size_height,
            p.size_width,
            p.size_length,
            p.weight,
            c.name AS category_name,
            b.name AS brand_name

        FROM
            orders o
        LEFT JOIN
            order_details od ON o.id = od.order_id
        LEFT JOIN
            customer_address_book shipping_cb ON o.shipping_address_id = shipping_cb.id
        LEFT JOIN
            customer_address_book billing_cb ON o.billing_address_id = billing_cb.id
        LEFT JOIN
            product_warehouse_branch pw ON od.product_id = pw.id
        LEFT JOIN
            products p ON od.product_id = p.id
        LEFT JOIN
            brands b ON p.brand_id = b.id
        LEFT JOIN
            categories c ON p.category_id = c.id
        LEFT JOIN
            warehouses w ON pw.warehouse_id = w.id
        WHERE
            o.id = ?
            AND o.customer_id = ?`;

    const result = await this.entityManager.query(query, [orderId, userId]);

    if (result.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const orderDetails = {
      order_id: result[0].id,
      total_price: result[0].total_price,
      discount: result[0].discount,
      vat: result[0].vat,
      delivery_charge: result[0].delivery_charge,
      payable_amount: result[0].payable_amount,
      order_type: result[0].order_type,
      order_status: result[0].order_status,
      created_at: result[0].created_at,
      updated_at: result[0].updated_at,
      shipping_address: {
        first_name: result[0].shipping_first_name,
        last_name: result[0].shipping_last_name,
        phone_number_1: result[0].shipping_phone_number_1,
        phone_number_2: result[0].shipping_phone_number_2,
        address: result[0].shipping_address,
        city: result[0].shipping_city,
        state: result[0].shipping_state,
        postal_code: result[0].shipping_postal_code,
        country_id: result[0].shipping_country_id,
        latitude: result[0].shipping_latitude,
        longitude: result[0].shipping_longitude,
        notes: result[0].shipping_notes,
      },
      billing_address: {
        first_name: result[0].billing_first_name,
        last_name: result[0].billing_last_name,
        phone_number_1: result[0].billing_phone_number_1,
        phone_number_2: result[0].billing_phone_number_2,
        address: result[0].billing_address,
        city: result[0].billing_city,
        state: result[0].billing_state,
        postal_code: result[0].billing_postal_code,
        country_id: result[0].billing_country_id,
        latitude: result[0].billing_latitude,
        longitude: result[0].billing_longitude,
        notes: result[0].billing_notes,
      },

      line_items: result.map((row: any) => ({
        name: row.product_name,
        quantity: row.product_quantity,
        regular_price: row.regular_price,
        sales_price: row.sales_price,
        active: row.active,
        has_own_product_img: row.has_own_product_img,
        unit: row.unit,
        size_height: row.size_height,
        size_width: row.size_width,
        size_length: row.size_length,
        weight: row.weight,
        category_name: row.category_name,
        brand_name: row.brand_name,
      })),
    };

    return orderDetails;
  }

  async getOrderHistory(): Promise<Orders[]> {
    const customer_id = this.request['user'].id;
    return this.orderRepository.find({
      where: { customer_id },
    });
  }
}

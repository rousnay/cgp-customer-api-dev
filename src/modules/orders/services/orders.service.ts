import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import {
  Client,
  DistanceMatrixResponse,
} from '@googlemaps/google-maps-services-js';

// import { CartService } from '@modules/cart/cart.service';
import { Cart } from '@modules/cart/cart.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Orders } from '../entities/orders.entity';
import { OrderDetails } from '../entities/order_details.entity';
import { NotificationService } from '@modules/notification/notification.service';
import { OrderNotificationService } from './order.notification.service';
import { PaymentService } from '@modules/payments/payments.service';
import { Deliveries } from '@modules/delivery/deliveries.entity';
import { UserAddressBookService } from '@modules/user-address-book/user-address-book-service';
import { OrderStatus, OrderType } from '@common/enums/order.enum';
import { LocationService } from '@modules/location/location.service';
import { ConfigService } from '@config/config.service';
import { ShippingStatus } from '@common/enums/delivery.enum';

@Injectable()
export class OrderService {
  private readonly googleMapsClient: Client;
  private readonly googleMapsApiKey: string;
  constructor(
    configService: ConfigService,
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
    @InjectRepository(Deliveries)
    private readonly deliveriesRepository: Repository<Deliveries>,
    private readonly orderNotificationService: OrderNotificationService,
    private readonly userAddressBookService: UserAddressBookService,
    private readonly locationService: LocationService,
  ) {
    this.googleMapsClient = new Client({});
    this.googleMapsApiKey = configService.googleMapsApiKey;
  }

  async placeOrder(createOrderDto: CreateOrderDto): Promise<any> {
    const customer = this.request['user'];
    let shipping_address_id: number;

    if (createOrderDto.shipping_address_id) {
      shipping_address_id = createOrderDto.shipping_address_id;
    } else {
      const shippingAddress = await this.userAddressBookService.createAddress(
        createOrderDto.shipping_address,
      );
      shipping_address_id = shippingAddress?.id;
    }

    const total_cost = createOrderDto.products.reduce((total, product) => {
      return total + product.regular_price * product.quantity;
    }, 0);

    const total_sales_price = createOrderDto.products.reduce(
      (total, product) => {
        return total + product.sales_price * product.quantity;
      },
      0,
    );

    const discount = total_cost - total_sales_price;
    const gst = total_sales_price * 0.1;
    const payable_amount = total_sales_price + gst;

    const newOrder = this.orderRepository.create({
      ...createOrderDto,
      order_type: OrderType.PRODUCT_AND_TRANSPORT,
      customer_id: customer?.id,
      shipping_address_id,
      total_cost,
      discount,
      gst,
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

    if (!savedOrderDetails) {
      throw new Error('Order not created');
    }

    //Handle delivery
    const savedDelivery = await this.deliveriesRepository.save({
      customer_id: customer?.id,
      order_id: savedOrder?.id,
    });

    //Handle cart products
    const productIdsToRemove = createOrderDto.products.map(
      (product) => product.product_id,
    );

    // Find and delete cart items for each product ID
    await Promise.all(
      productIdsToRemove.map(async (productId) => {
        await this.cartRepository.delete({
          product_id: productId,
          customer_id: customer?.id,
        });
      }),
    );

    await this.orderNotificationService.sendOrderNotification(
      savedOrder,
      'order_placed',
    );

    return {
      warehouse_branch_id: createOrderDto?.warehouse_branch_id,
      ...savedOrder,
      line_items: savedOrderDetails,
      delivery: savedDelivery,
    };
  }

  // async cancelOrder(orderId: number): Promise<void> {
  //   const order = await this.orderRepository.findOne({
  //     where: { id: orderId, customer_id: this.request['user'].id },
  //   });
  //   if (!order) {
  //     throw new NotFoundException('Order not found');
  //   }
  //   order.order_status = OrderStatus.CANCELLED;
  //   await this.orderRepository.save(order);
  //   await this.orderNotificationService.sendOrderNotification(
  //     order,
  //     'order_cancelled',
  //   );
  // }

  async cancelOrder(
    orderId: number,
    orderCancelReasonId: number,
  ): Promise<any> {
    // Check if the order exists
    const order = await this.entityManager.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId],
    );
    if (!order.length) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    // Check if the cancel reason exists
    const cancelReason = await this.entityManager.query(
      'SELECT * FROM order_cancel_reasons WHERE id = ?',
      [orderCancelReasonId],
    );
    if (!cancelReason.length) {
      throw new NotFoundException(
        `Order cancel reason with ID ${orderCancelReasonId} not found.`,
      );
    }

    // Update the orders table
    await this.entityManager.query(
      `UPDATE orders
       SET order_status = ?, cancelled_at = ?, cancel_reason_id = ?
       WHERE id = ?`,
      [OrderStatus.CANCELLED, new Date(), orderCancelReasonId, orderId],
    );

    // Update the deliveries table
    await this.entityManager.query(
      `UPDATE deliveries
       SET shipping_status =?, cancelled_at = ?, cancel_reason_id = ?
       WHERE order_id = ?`,
      [ShippingStatus.CANCELLED, new Date(), orderCancelReasonId, orderId],
    );

    return orderId;
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
        w.id AS warehouse_id,
        w.name AS warehouse_name,

        wb.id AS branch_id,
        wb.name AS branch_name,
        wb.branch_type,
        wb.phone AS branch_phone,
        wb.address AS branch_address,
        wb.postal_code AS branch_postal_code,
        wb.latitude AS branch_latitude,
        wb.longitude AS branch_longitude,
        wb.contact_person_name,
        wb.contact_person_email,

        billing_cb.id AS billing_id,
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
        o.total_cost,

        pickup_cb.first_name AS pickup_first_name,
        pickup_cb.last_name AS pickup_last_name,
        pickup_cb.phone_number_1 AS pickup_phone_number_1,
        pickup_cb.phone_number_2 AS pickup_phone_number_2,
        pickup_cb.address AS pickup_address,
        pickup_cb.city AS pickup_city,
        pickup_cb.state AS pickup_state,
        pickup_cb.postal_code AS pickup_postal_code,
        pickup_cb.country_id AS pickup_country_id,
        pickup_cb.latitude AS pickup_latitude,
        pickup_cb.longitude AS pickup_longitude,
        pickup_cb.notes AS pickup_notes,

        shipping_cb.id AS shipping_id,
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
        b.name AS brand_name,

        d.shipping_status,
        d.rider_id,
        d.init_distance,
        d.init_duration,
        d.final_distance,
        d.final_duration,
        d.created_at,
        d.accepted_at,
        d.reached_pickup_point_at,
        d.picked_up_at,
        d.reached_delivery_point_at,
        d.delivered_at,
        d.cancelled_at,
        d.updated_at,

        r.first_name AS rider_first_name,
        r.last_name AS rider_last_name,
        r.email AS rider_email,
        r.phone AS rider_phone,

        v.license_plate AS vehicle_license_plate

    FROM
        orders o
    LEFT JOIN
        order_details od ON o.id = od.order_id
    LEFT JOIN
        user_address_book billing_cb ON o.billing_address_id = billing_cb.id
    LEFT JOIN
        user_address_book pickup_cb ON o.pickup_address_id = pickup_cb.id
    LEFT JOIN
        user_address_book shipping_cb ON o.shipping_address_id = shipping_cb.id
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
    LEFT JOIN
        warehouse_branches wb ON pw.warehouse_branch_id = wb.id
    LEFT JOIN
        deliveries d ON o.id = d.order_id
    LEFT JOIN
        riders r ON d.rider_id = r.id
    LEFT JOIN
        vehicles v ON d.vehicle_id = v.id
    WHERE
        o.id = ?
        AND o.customer_id = ?`;

    const result = await this.entityManager.query(query, [orderId, userId]);

    if (result.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const warehouse = {
      id: Number(result[0].warehouse_id),
      name: result[0].warehouse_name,
      // warehouse_branch: {
      //   id: result[0].branch_id,
      //   name: result[0].branch_name,
      //   type: result[0].branch_type,
      //   phone: result[0].branch_phone,
      //   address: result[0].branch_address,
      //   postal_code: result[0].branch_postal_code,
      //   latitude: Number(result[0].branch_latitude),
      //   longitude: Number(result[0].branch_longitude),
      //   contact_person_name: result[0].contact_person_name,
      //   contact_person_email: result[0].contact_person_email,
      // },
    };

    let pickup_address;

    if (result[0].order_type === OrderType.TRANSPORTATION_ONLY) {
      pickup_address = {
        name: result[0].pickup_first_name + ' ' + result[0].pickup_last_name,
        phone: result[0].pickup_phone_number_1,
        phone_number_2: result[0].pickup_phone_number_2,
        address: result[0].pickup_address,
        city: result[0].pickup_city,
        state: result[0].pickup_state,
        postal_code: result[0].pickup_postal_code,
        country_id: result[0].pickup_country_id,
        latitude: result[0].pickup_latitude,
        longitude: result[0].pickup_longitude,
        notes: result[0].pickup_notes,
      };
    } else {
      pickup_address = {
        id: Number(result[0].branch_id),
        name: result[0].branch_name,
        type: result[0].branch_type,
        phone: result[0].branch_phone,
        address: result[0].branch_address,
        postal_code: result[0].branch_postal_code,
        latitude: Number(result[0].branch_latitude),
        longitude: Number(result[0].branch_longitude),
        contact_person_name: result[0].contact_person_name,
        contact_person_email: result[0].contact_person_email,
      };
    }

    const line_items = result.map((row: any) => ({
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
    }));

    const delivery_info = {
      shipping_status: result[0].shipping_status,
      init_distance: result[0].init_distance,
      init_duration: result[0].init_duration,
      final_distance: result[0].final_distance,
      final_duration: result[0].final_duration,
      estimated_remaining_distance: null,
      estimated_remaining_time: null,
      created_at: result[0].created_at,
      accepted_at: result[0].accepted_at,
      reached_pickup_point_at: result[0].reached_pickup_point_at,
      picked_up_at: result[0].picked_up_at,
      reached_delivery_point_at: result[0].reached_delivery_point_at,
      delivered_at: result[0].delivered_at,
      cancelled_at: result[0].cancelled_at,
      updated_at: result[0].updated_at,

      rider: {
        id: result[0].rider_id,
        name: result[0].rider_first_name + ' ' + result[0].rider_last_name,
        vehicle_license_plate: result[0].vehicle_license_plate,
        // media_url: ,
        email: result[0].rider_email,
        phone: result[0].rider_phone,
        location: null,
      },
    };

    if (result[0].rider_id) {
      const rider_location = await this.locationService.getLocation(
        result[0].rider_id,
      );

      delivery_info.rider.location = {
        latitude: rider_location.location.coordinates[1],
        longitude: rider_location.location.coordinates[0],
        updated_at: rider_location.updatedAt,
      };

      const response: DistanceMatrixResponse =
        await this.googleMapsClient.distancematrix({
          params: {
            origins: [
              rider_location.location.coordinates[1] +
                ',' +
                rider_location.location.coordinates[0],
            ],
            destinations: [
              result[0].shipping_latitude.toString() +
                ',' +
                result[0].shipping_longitude.toString(),
            ],
            key: this.googleMapsApiKey,
          },
        });

      if (
        response.status === 200 &&
        response.data.rows[0].elements[0].status !== 'ZERO_RESULTS'
      ) {
        // console.log(response.data.rows[0].elements[0].status !== 'ZERO_RESULTS');
        const estimated_distance =
          response.data.rows[0].elements[0].distance.value / 1000;
        const estimated_duration =
          response.data.rows[0].elements[0].duration.value / 60;

        delivery_info.estimated_remaining_distance = estimated_distance;
        delivery_info.estimated_remaining_time = estimated_duration;
      } else {
        throw new NotFoundException(
          'No location has been found with given coordinates',
        );
      }
    }

    const orderDetails = {
      order_id: result[0].id,
      total_price: result[0].total_cost,
      discount: result[0].discount,
      vat: result[0].vat,
      delivery_charge: result[0].delivery_charge,
      payable_amount: result[0].payable_amount,
      order_type: result[0].order_type,
      order_status: result[0].order_status,
      created_at: result[0].created_at,
      updated_at: result[0].updated_at,
      warehouse: null,
      billing_address: {
        id: result[0].billing_address_id,
        name: result[0].billing_first_name + ' ' + result[0].billing_last_name,
        phone: result[0].billing_phone_number_1,
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
      pickup_address: pickup_address,
      shipping_address: {
        id: result[0].shipping_address_id,
        name:
          result[0].shipping_first_name + ' ' + result[0].shipping_last_name,
        phone: result[0].shipping_phone_number_1,
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
      line_items: null,
      delivery_info: delivery_info,
    };

    if (result[0].order_type === OrderType.PRODUCT_AND_TRANSPORT) {
      orderDetails.warehouse = warehouse;
      orderDetails.line_items = line_items;
    } else {
      orderDetails.pickup_address = pickup_address;
    }

    return orderDetails;
  }

  async getOrderHistory(): Promise<Orders[]> {
    const customer_id = this.request['user'].id;
    console.log(customer_id);
    return await this.orderRepository.find({
      where: { customer_id: customer_id },
      order: {
        created_at: 'DESC',
      },
    });
  }
}

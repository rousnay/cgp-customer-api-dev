import { Injectable } from '@nestjs/common';
import { LocationService } from '@modules/location/location.service';
import { EntityManager, Repository } from 'typeorm';

import { CreateDeliveryRequestDto } from '@modules/delivery/dtos/create-delivery-request.dto';
import { OrderType } from '@common/enums/order.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from '@modules/orders/entities/orders.entity';
import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
import { Deliveries } from './deliveries.entity';
import { DeliveryStatus } from '@common/enums/delivery.enum';
@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Deliveries)
    private deliveriesRepository: Repository<Deliveries>,
    private readonly entityManager: EntityManager,
    private locationService: LocationService,
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    @InjectRepository(UserAddressBook)
    private userAddressBookRepository: Repository<UserAddressBook>,
  ) {}

  async getDeliveryRequestPayloadByStripeId(
    stripeId: string,
  ): Promise<CreateDeliveryRequestDto> {
    console.log('getDeliveryRequestPayloadByStripeId called!');
    const payment = await this.entityManager
      .createQueryBuilder()
      .select('*')
      .from('payments', 'p')
      .where('p.stripe_id = :stripeId', {
        stripeId,
      })
      .getRawOne();

    console.log('payment', payment);

    const order = await this.ordersRepository.findOne({
      where: { id: payment?.order_id },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    console.log('order', order);

    let pickupLocation, requestFrom;

    if (
      order.order_type === OrderType.PRODUCT_AND_TRANSPORT ||
      order.order_type === OrderType.WAREHOUSE_TRANSPORTATION
    ) {
      const warehouseId = order.warehouse_id;
      const warehouse = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from('warehouses', 'p')
        .where('p.id = :customerId', {
          warehouseId,
        })
        .getRawOne();

      requestFrom = {
        id: warehouse.id.toString(),
        name: warehouse.name,
      };

      pickupLocation = await this.userAddressBookRepository.findOne({
        where: { id: order.warehouse_id },
      });
    } else if (order.order_type === OrderType.TRANSPORTATION_ONLY) {
      const customerId = order.customer_id;
      const customer = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from('customers', 'p')
        .where('p.id = :customerId', {
          customerId,
        })
        .getRawOne();

      requestFrom = {
        id: customer.id.toString(),
        name: customer.first_name + ' ' + customer.last_name,
      };

      pickupLocation = await this.userAddressBookRepository.findOne({
        where: { id: order.pickup_address_id },
      });
    }

    const dropOffLocation = await this.userAddressBookRepository.findOne({
      where: { id: order.shipping_address_id },
    });

    const delivery = await this.deliveriesRepository.findOne({
      where: { order_id: payment?.order_id },
    });
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    return {
      orderId: payment.order_id,
      stripeId: payment.stripe_id,
      deliveryId: delivery.id,
      requestFrom,
      pickupLocation,
      dropOffLocation,
      totalDistance: delivery.init_distance.toString(),
      totalWeight: '2', // NEED TO REWORK THIS
      deliveryCost: delivery.delivery_charge,
      estimatedArrivalTime: '250', // NEED TO REWORK THIS
      status: DeliveryStatus.SEARCHING,
      orderType: order.order_type,
      assignedRider: null,
    };
  }

  async getRiderDeviceTokens(
    riderIds: number[],
  ): Promise<{ riderId: number; deviceTokens: string[] }[]> {
    const userIdQuery = `
      SELECT id AS riderId, user_id AS userId
      FROM riders
      WHERE id IN (${riderIds.join(',')})
    `;

    const userMappings = await this.entityManager.query(userIdQuery);
    console.log('userMappings', userMappings);

    const userIds = userMappings.map((mapping) => mapping.userId);

    if (userIds.length === 0) {
      return [];
    }
    console.log('userIds', userIds);

    const deviceTokensQuery = `
      SELECT user_id AS userId, device_token AS deviceToken
      FROM user_device_tokens
      WHERE user_id IN (${userIds.join(',')})
    `;

    const deviceTokensMappings = await this.entityManager.query(
      deviceTokensQuery,
    );

    console.log('deviceTokensQuery', deviceTokensQuery);

    const userDeviceTokensMap = deviceTokensMappings.reduce((acc, token) => {
      if (!acc[token.userId]) {
        acc[token.userId] = [];
      }
      if (!acc[token.userId].includes(token.deviceToken)) {
        acc[token.userId].push(token.deviceToken);
      }
      return acc;
    }, {});

    console.log('userDeviceTokensMap', userDeviceTokensMap);

    const riderDeviceTokens = userMappings.map((mapping) => ({
      userId: mapping.userId,
      riderId: mapping.riderId,
      deviceTokens: userDeviceTokensMap[mapping.userId] || [],
    }));

    console.log('riderDeviceTokens', riderDeviceTokens);

    return riderDeviceTokens;
  }

  async sendDeliveryRequest(stripe_id: string): Promise<any> {
    console.log('sendDeliveryRequest called');
    const query = `
        SELECT u.latitude, u.longitude
        FROM payments p
        INNER JOIN orders o ON o.id = p.order_id
        INNER JOIN user_address_book u ON u.id = o.pickup_address_id
        WHERE p.stripe_id = ?
    `;

    const result = await this.entityManager.query(query, [stripe_id]);
    console.log('result', result);
    if (result?.length > 0) {
      const { latitude, longitude } = result[0];
      const nearByRiders = await this.locationService.getNearbyRiders(
        latitude,
        longitude,
        15,
      );
      console.log('nearByRiders', nearByRiders);

      const riderIds = nearByRiders.map((rider) => rider.riderId);
      console.log('riderIds', riderIds);

      const riderDeviceTokens = await this.getRiderDeviceTokens(riderIds);
      console.log('riderDeviceTokens', riderDeviceTokens);

      return riderDeviceTokens;

      // return nearByRiders;
    } else {
      console.log('No results found');
      return [];
    }
  }
}

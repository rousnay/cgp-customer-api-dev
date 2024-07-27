import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDeliveryRequestDto } from '../dtos/create-delivery-request.dto';
import { UpdateDeliveryRequestDto } from '../dtos/update-delivery-request.dto';
import {
  DeliveryRequest,
  AssignedRider,
} from '../schemas/delivery-request.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Deliveries } from '../deliveries.entity';
import { EntityManager, Repository } from 'typeorm';
import { Orders } from '@modules/orders/entities/orders.entity';
import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
import { OrderType } from '@common/enums/order.enum';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { AppConstants } from '@common/constants/constants';
import { ConfigService } from '@config/config.service';
import { LocationService } from '@modules/location/location.service';
import { NotificationService } from '@modules/notification/notification.service';

@Injectable()
export class DeliveryRequestService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
    @InjectRepository(Deliveries)
    private deliveriesRepository: Repository<Deliveries>,
    private readonly entityManager: EntityManager,
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    @InjectRepository(UserAddressBook)
    private userAddressBookRepository: Repository<UserAddressBook>,
    private locationService: LocationService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async buildDeliveryRequestPayload(
    userId: number,
    orderId: number,
  ): Promise<any> {
    console.log('buildDeliveryRequestPayload called!');

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    console.log('order', order);

    let requestFrom, pickupLocation, dropOffLocation;

    if (
      order.order_type === OrderType.PRODUCT_AND_TRANSPORT ||
      order.order_type === OrderType.WAREHOUSE_TRANSPORTATION
    ) {
      const warehouseId = order.warehouse_id;
      // const warehouse = await this.entityManager
      //   .createQueryBuilder()
      //   .select('*')
      //   .from('warehouses', 'w')
      //   .where('w.id = :warehouseId', {
      //     warehouseId,
      //   })
      //   .getRawOne();

      const warehouseBranches = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from('warehouse_branches', 'wb')
        .where('wb.warehouse_id = :warehouseId', {
          warehouseId,
        })
        .getRawMany();
      // get customer's overall review
      const given_to_id = warehouseId;
      const result = await this.entityManager.query(
        'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ?',
        [given_to_id],
      );

      const averageRating = result[0].average_rating || 0;
      const totalRatings = result[0].total_ratings || 0;

      const avg_rating = {
        average_rating: Number(averageRating),
        total_ratings: Number(totalRatings),
      };
      // logo
      const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

      const logo = await this.entityManager.query(logo_cloudflare_id_query, [
        warehouseId,
      ]);

      let logo_url = null;

      if (logo.length != 0 && logo[0].cloudflare_id != null) {
        logo_url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          logo[0].cloudflare_id +
          '/' +
          this.cfMediaVariant;
      }
      requestFrom = {
        userId,
        id: Number(warehouseBranches[0].id),
        name: warehouseBranches[0].name,
        url: logo_url,
        avg_rating,
      };

      pickupLocation = {
        id: Number(warehouseBranches[0].id),
        warehouse_id: Number(warehouseId),
        name: warehouseBranches[0].name,
        phone: warehouseBranches[0].phone,
        email: warehouseBranches[0].email,
        address: warehouseBranches[0].address,
        contact_person_name: warehouseBranches[0].contact_person_name,
        contact_person_email: warehouseBranches[0].contact_person_email,
        postal_code: warehouseBranches[0].postal_code,
        latitude: Number(warehouseBranches[0].latitude),
        longitude: Number(warehouseBranches[0].longitude),
        address_type: 'pickup',
      };

      // pickupLocation = await this.userAddressBookRepository.findOne({
      //   where: { id: order.warehouse_id },
      // });
    } else {
      const customerId = order.customer_id;
      const customer = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from('customers', 'p')
        .where('p.id = :customerId', {
          customerId,
        })
        .getRawOne();

      // get customer's overall review
      const given_to_id = customerId;
      const result = await this.entityManager.query(
        'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ?',
        [given_to_id],
      );

      const averageRating = result[0].average_rating || 0;
      const totalRatings = result[0].total_ratings || 0;

      const avg_rating = {
        average_rating: Number(averageRating),
        total_ratings: Number(totalRatings),
      };

      //url
      let customer_profile_image_url = null;

      if (customer.profile_image_cf_media_id != null) {
        const cloudflare_id = await this.entityManager
          .createQueryBuilder()
          .select(['cf.cloudflare_id'])
          .from('cf_media', 'cf')
          .where('cf.id = :id', { id: customer.profile_image_cf_media_id })
          .getRawOne();

        customer_profile_image_url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          cloudflare_id.cloudflare_id +
          '/' +
          this.cfMediaVariant;
      }

      requestFrom = {
        userId,
        id: customer.id,
        name: customer.first_name + ' ' + customer.last_name,
        url: customer_profile_image_url,
        avg_rating,
      };

      console.log('customer', customer);
      console.log('requestFrom', requestFrom);

      const pickupLocationRaw = await this.userAddressBookRepository.findOne({
        where: { id: order.pickup_address_id },
      });

      if (pickupLocationRaw) {
        const { id, first_name, last_name, phone_number_1, ...rest } =
          pickupLocationRaw;

        pickupLocation = {
          id: id,
          name: first_name + ' ' + last_name,
          phone: phone_number_1,
          ...rest,
        };
      }
    }

    const dropOffLocationRaw = await this.userAddressBookRepository.findOne({
      where: { id: order.shipping_address_id },
    });

    if (dropOffLocationRaw) {
      const { id, first_name, last_name, phone_number_1, ...rest } =
        dropOffLocationRaw;

      dropOffLocation = {
        id: id,
        name: first_name + ' ' + last_name,
        phone: phone_number_1,
        ...rest,
      };
    }

    const { stripe_id } = await this.entityManager
      .createQueryBuilder()
      .select('u.stripe_id', 'stripe_id')
      .from('users', 'u')
      .where({ id: userId })
      .getRawOne();

    const delivery = await this.deliveriesRepository.findOne({
      where: { order_id: orderId },
    });
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    return {
      orderId: orderId,
      stripeId: stripe_id || '',
      deliveryId: delivery.id,
      targetedVehicleTypeId: delivery.vehicle_type_id,
      requestFrom,
      pickupLocation,
      dropOffLocation,
      totalDistance: delivery.init_distance,
      deliveryCost: delivery.delivery_charge,
      riderFee: delivery.rider_fee,
      totalWeight: '2', // NEED TO REWORK THIS
      approxWeight: '2.5', // NEED TO REWORK THIS
      maxWeight: '5', // NEED TO REWORK THIS
      estimatedArrivalTime: '250', // NEED TO REWORK THIS
      status: ShippingStatus.SEARCHING,
      orderType: order.order_type,
      assignedRider: null,
      createdAt: new Date(),
    };
  }

  async storeDeliveryRequest(
    createDeliveryRequestDto: CreateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    console.log('storeDeliveryRequest called!');
    console.log('createDeliveryRequestDto', createDeliveryRequestDto);

    const createdDeliveryRequest = new this.deliveryRequestModel(
      createDeliveryRequestDto,
    );
    return createdDeliveryRequest.save();
  }

  async getRidersDeviceTokens(riderIds: number[]): Promise<any> {
    console.log('getRidersDeviceTokens called!');
    console.log('riderIds', riderIds);

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

  async getNearByRidersIdsByOrderID(orderId: number): Promise<any> {
    console.log('getNearByRidersIdsByOrderID called!');
    console.log('orderId', orderId);

    let pickup_coordinates_query;
    const query = `
        SELECT o.order_type, o.id
        FROM orders o
        WHERE o.id = ?
    `;
    const order = await this.entityManager.query(query, [orderId]);

    if (
      order[0].order_type === OrderType.PRODUCT_AND_TRANSPORT ||
      order[0].order_type === OrderType.WAREHOUSE_TRANSPORTATION
    ) {
      pickup_coordinates_query = `
        SELECT wb.latitude, wb.longitude
        FROM orders o
        INNER JOIN warehouse_branches wb ON wb.warehouse_id = o.warehouse_id
        WHERE o.id = ?
    `;
    } else {
      pickup_coordinates_query = `
        SELECT u.latitude, u.longitude
        FROM orders o
        INNER JOIN user_address_book u ON u.id = o.pickup_address_id
        WHERE o.id = ?
    `;
    }

    const pickup_address_coordinates = await this.entityManager.query(
      pickup_coordinates_query,
      [order[0].id],
    );
    console.log('result', pickup_address_coordinates);

    if (pickup_address_coordinates?.length > 0) {
      const { latitude, longitude } = pickup_address_coordinates[0];
      const nearByRiders = await this.locationService.getNearbyRiders(
        latitude,
        longitude,
        15,
      );
      console.log('nearByRiders', nearByRiders);

      const nearByRidersIds = nearByRiders.map((rider) => rider.riderId);
      console.log('nearByRidersId', nearByRidersIds);

      return nearByRidersIds;
    } else {
      console.log('No results found');
      return [];
    }
  }

  async sendDeliveryRequest(userId: number, orderId: number): Promise<any> {
    console.log('sendDeliveryRequest operated successfully');
    console.log('userId', userId, 'orderId', orderId);

    const buildDeliveryRequestPayload = await this.buildDeliveryRequestPayload(
      userId,
      orderId,
    );

    const getStoredDeliveryRequestData = await this.storeDeliveryRequest(
      buildDeliveryRequestPayload,
    );

    const nearByRidersIds = await this.getNearByRidersIdsByOrderID(orderId);
    const nearRidersDeviceTokens = await this.getRidersDeviceTokens(
      nearByRidersIds,
    );

    const requestedByUserId = getStoredDeliveryRequestData?.requestFrom?.id;
    const requestedByUserName = getStoredDeliveryRequestData?.requestFrom?.name;
    const requestId = getStoredDeliveryRequestData?.id;
    const title = 'New Delivery Request';
    const message =
      'You have a new delivery request from ' + requestedByUserName;
    const data = {
      target: 'rider',
      type: 'delivery_request',
      requestId: requestId,
      requestedByUserId: requestedByUserId.toString(),
      requestedByUserName: requestedByUserName,
    };

    for (const rider of nearRidersDeviceTokens) {
      console.log('rider', rider);
      for (const deviceToken of rider.deviceTokens) {
        await this.notificationService.sendAndStoreDeliveryRequestNotification(
          rider.userId,
          deviceToken,
          title,
          message,
          { ...data, riderId: rider.riderId.toString() },
        );
      }
    }

    return {
      deliveryRequest: getStoredDeliveryRequestData,
      nearByRidersIds: nearByRidersIds,
      // nearRiders: nearByRidersIds,
      // nearRidersDeviceTokens: nearRidersDeviceTokens,
    };
  }
}

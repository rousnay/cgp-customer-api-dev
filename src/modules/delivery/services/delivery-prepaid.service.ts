// import { Injectable } from '@nestjs/common';
// import { LocationService } from '@modules/location/location.service';
// import { EntityManager, Repository } from 'typeorm';

// import { CreateDeliveryRequestDto } from '@modules/delivery/dtos/create-delivery-request.dto';
// import { OrderType } from '@common/enums/order.enum';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Orders } from '@modules/orders/entities/orders.entity';
// import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
// import { Deliveries } from './deliveries.entity';
// import { ShippingStatus } from '@common/enums/delivery.enum';
// @Injectable()
// export class DeliveryService {
//   constructor(
//     @InjectRepository(Deliveries)
//     private deliveriesRepository: Repository<Deliveries>,
//     private readonly entityManager: EntityManager,
//     private locationService: LocationService,
//     @InjectRepository(Orders)
//     private ordersRepository: Repository<Orders>,
//     @InjectRepository(UserAddressBook)
//     private userAddressBookRepository: Repository<UserAddressBook>,
//   ) {}

//   async getRiderDeviceTokens(
//     riderIds: number[],
//   ): Promise<{ riderId: number; deviceTokens: string[] }[]> {
//     const userIdQuery = `
//       SELECT id AS riderId, user_id AS userId
//       FROM riders
//       WHERE id IN (${riderIds.join(',')})
//     `;

//     const userMappings = await this.entityManager.query(userIdQuery);
//     console.log('userMappings', userMappings);

//     const userIds = userMappings.map((mapping) => mapping.userId);

//     if (userIds.length === 0) {
//       return [];
//     }
//     console.log('userIds', userIds);

//     const deviceTokensQuery = `
//       SELECT user_id AS userId, device_token AS deviceToken
//       FROM user_device_tokens
//       WHERE user_id IN (${userIds.join(',')})
//     `;

//     const deviceTokensMappings = await this.entityManager.query(
//       deviceTokensQuery,
//     );

//     console.log('deviceTokensQuery', deviceTokensQuery);

//     const userDeviceTokensMap = deviceTokensMappings.reduce((acc, token) => {
//       if (!acc[token.userId]) {
//         acc[token.userId] = [];
//       }
//       if (!acc[token.userId].includes(token.deviceToken)) {
//         acc[token.userId].push(token.deviceToken);
//       }
//       return acc;
//     }, {});

//     console.log('userDeviceTokensMap', userDeviceTokensMap);

//     const riderDeviceTokens = userMappings.map((mapping) => ({
//       userId: mapping.userId,
//       riderId: mapping.riderId,
//       deviceTokens: userDeviceTokensMap[mapping.userId] || [],
//     }));

//     console.log('riderDeviceTokens', riderDeviceTokens);

//     return riderDeviceTokens;
//   }

//   async sendDeliveryRequest(stripe_id: string): Promise<any> {
//     console.log('sendDeliveryRequest called');
//     let pickup_coordinates_query;

//     const query = `
//         SELECT o.order_type AS order_type, o.id AS order_id
//         FROM payments p
//         INNER JOIN orders o ON o.id = p.order_id
//         WHERE p.stripe_id = ?
//     `;

//     const order_type = await this.entityManager.query(query, [stripe_id]);

//     console.log('order_type', order_type);

//     if (
//       order_type[0].order_type === OrderType.PRODUCT_AND_TRANSPORT ||
//       order_type[0].order_type === OrderType.WAREHOUSE_TRANSPORTATION
//     ) {
//       pickup_coordinates_query = `
//         SELECT wb.latitude, wb.longitude
//         FROM orders o
//         INNER JOIN warehouse_branches wb ON wb.warehouse_id = o.warehouse_id
//         WHERE o.id = ?
//     `;
//     } else {
//       pickup_coordinates_query = `
//         SELECT u.latitude, u.longitude
//         FROM orders o
//         INNER JOIN user_address_book u ON u.id = o.pickup_address_id
//         WHERE o.id = ?
//     `;
//     }

//     const pickup_address_coordinates = await this.entityManager.query(
//       pickup_coordinates_query,
//       [order_type[0].order_id],
//     );
//     console.log('result', pickup_address_coordinates);

//     if (pickup_address_coordinates?.length > 0) {
//       const { latitude, longitude } = pickup_address_coordinates[0];
//       const nearByRiders = await this.locationService.getNearbyRiders(
//         latitude,
//         longitude,
//         15,
//       );
//       console.log('nearByRiders', nearByRiders);

//       const riderIds = nearByRiders.map((rider) => rider.riderId);
//       console.log('riderIds', riderIds);

//       const riderDeviceTokens = await this.getRiderDeviceTokens(riderIds);
//       console.log('riderDeviceTokens', riderDeviceTokens);

//       return riderDeviceTokens;

//       // return nearByRiders;
//     } else {
//       console.log('No results found');
//       return [];
//     }
//   }
// }

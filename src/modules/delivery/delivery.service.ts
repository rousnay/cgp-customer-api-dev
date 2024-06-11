import { Injectable } from '@nestjs/common';
import { LocationService } from '@modules/location/location.service';
import { EntityManager } from 'typeorm';
@Injectable()
export class DeliveryService {
  constructor(
    private locationService: LocationService,
    private readonly entityManager: EntityManager,
  ) {}

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

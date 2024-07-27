import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ConfigService } from '@config/config.service';
import { Customers } from '@modules/customers/entities/customers.entity';
import { AppConstants } from '@common/constants/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @InjectRepository(Customers)
    private customerRepository: Repository<Customers>,
    configService: ConfigService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });

    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async validate(payload: any) {
    const user = await this.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async validateUser(payload: any): Promise<any> {
    // Extract user id from the payload
    const customer_id = payload.sub;
    // Find the user in the database by userId
    const user = await this.customerRepository.findOne({
      where: { id: customer_id },
    });

    const avg_rating = await this.getCustomerAvgRating(user?.id);
    const ongoing_delivery = await this.getCustomerOngoingDelivery(customer_id);
    const url = await this.getCustomerProfileImageUrl(
      user?.profile_image_cf_media_id,
    );

    const addReview = { ...user, url, avg_rating, ongoing_delivery };
    // If user is found, return the user, otherwise return null
    if (user) {
      return addReview;
    } else {
      return null;
    }
  }

  async getCustomerAvgRating(userId: any) {
    const given_to_id = userId;
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

    return avg_rating;
  }

  async getCustomerProfileImageUrl(
    profile_image_cf_media_id: any,
  ): Promise<any> {
    let url = null;

    if (profile_image_cf_media_id != null) {
      try {
        const cloudflare_id = await this.entityManager
          .createQueryBuilder()
          .select(['cf.cloudflare_id'])
          .from('cf_media', 'cf')
          .where('cf.id = :id', { id: profile_image_cf_media_id })
          .getRawOne();

        url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          cloudflare_id.cloudflare_id +
          '/' +
          this.cfMediaVariant;

        return url;
      } catch (e) {
        // do nothing
      }
    } else {
      return null;
    }
  }

  async getCustomerOngoingDelivery(customerId: any): Promise<{ data: any }> {
    let ongoing_delivery = null;
    // find deliver id and order id for find ongoing trip
    const deliveriesData = await this.entityManager.query(
      `
    SELECT
        d.id, d.customer_id, d.order_id, d.shipping_status
    FROM
        deliveries d
    INNER JOIN orders o ON d.order_id = o.id
    WHERE
        d.shipping_status IN ('waiting', 'searching', 'accepted', 'reached_at_pickup_point', 'picked_up', 'reached_at_delivery_point')
        AND d.customer_id = ?
        AND o.order_type = 'transportation_only'
    `,
      [customerId],
    );

    if (deliveriesData.length > 0) {
      ongoing_delivery = {
        order_id: deliveriesData[0].order_id || null,
        delivery_id: deliveriesData[0].id || null,
        shipping_status: deliveriesData[0].shipping_status || null,
      };
      return ongoing_delivery;
    } else {
      return null;
    }
  }
}

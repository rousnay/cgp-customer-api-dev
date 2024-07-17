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

    // get customer's overall review
    const given_to_id = user?.id;
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
    let url = null;

    if (user.profile_image_cf_media_id != null) {
      try {
        const cloudflare_id = await this.entityManager
          .createQueryBuilder()
          .select(['cf.cloudflare_id'])
          .from('cf_media', 'cf')
          .where('cf.id = :id', { id: user.profile_image_cf_media_id })
          .getRawOne();

        url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          cloudflare_id.cloudflare_id +
          '/' +
          this.cfMediaVariant;
      } catch (e) {
        // do nothing
      }
    }

    const addReview = { ...user, avg_rating, url };

    // If user is found, return the user, otherwise return null
    if (user) {
      return addReview;
    } else {
      return null;
    }
  }
}

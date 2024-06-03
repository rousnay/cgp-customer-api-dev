import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from 'src/config/config.service';
import { Customers } from 'src/modules/customers/entities/customers.entity';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Customers)
    private riderRepository: Repository<Customers>,
    configService: ConfigService, // No need to declare it as private or readonly, Since configService is only needed in the constructor
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
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
    const rider_id = payload.sub;

    // Find the user in the database by userId
    const user = await this.riderRepository.findOne({
      where: { id: rider_id },
    });

    // If user is found, return the user, otherwise return null
    if (user) {
      return user;
    } else {
      return null;
    }
  }
}

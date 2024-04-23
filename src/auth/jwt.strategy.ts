import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Customers } from 'src/customers/entities/customers.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Customers)
    private customerRepository: Repository<Customers>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // async validate(payload: any) {
  //   // console.log(payload.payload.username);
  //   return { username: payload.payload.username, id: payload.payload.sub };
  // }

  async validate(payload: any) {
    const user = await this.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async validateUser(payload: any): Promise<any> {
    // Extract user id from the payload
    const customer_id = payload.payload.sub;

    // Find the user in the database by userId
    const user = await this.customerRepository.findOne({
      where: { id: customer_id },
    });

    // If user is found, return the user, otherwise return null
    if (user) {
      return user;
    } else {
      return null;
    }
  }
}

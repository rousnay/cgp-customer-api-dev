import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    identity: string,
    password: string,
    user_type: string,
  ): Promise<any> {
    // Call your Laravel API endpoint to authenticate user
    const user = await this.authService.login(identity, password, user_type);
    // You need to implement this method in AuthService
    return user;
  }
}

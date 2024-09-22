import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '@config/config.service';
import { ConfigModule } from '@config/config.module';
import { PasswordService } from '@core/guards/password.service';
import { LocalStrategy } from '@core/guards/local.strategy';
import { JwtStrategy } from '@core/guards/jwt.strategy';
import { Customers } from '@modules/customers/entities/customers.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ReviewService } from '@modules/review/review.service';
import { CustomersService } from '@modules/customers/services/customers.service';
import { Preferences } from '@modules/application/entities/preferences.entity';
import { PaymentMethodService } from '@modules/payments/services/payment-method.service';
import { UserDeleted } from '@modules/customers/entities/user-deleted.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([Customers, Preferences, UserDeleted]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '90d' },
      }),
    }),
  ],
  exports: [AuthService, JwtStrategy],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    PasswordService,
    CustomersService,
    PaymentMethodService,
    ReviewService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

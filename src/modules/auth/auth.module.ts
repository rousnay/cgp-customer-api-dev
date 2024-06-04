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

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([Customers]),
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
  providers: [AuthService, LocalStrategy, JwtStrategy, PasswordService],
  controllers: [AuthController],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { ConfigService } from './config.service';
import configPayment from './payment.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration, configPayment],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

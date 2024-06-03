import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { ConfigService } from './config.service';
import configStripe from './stripe.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration, configStripe],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

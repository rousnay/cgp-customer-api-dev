import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@config/config.module';
import { PaymentToken } from './entities/payment-token.entity';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';
import { DeliveryService } from '@modules/delivery/delivery.service';
import { LocationService } from '@modules/location/location.service';
import { LocationSchema } from '@modules/location/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PaymentToken]),
    MongooseModule.forFeature([{ name: 'Location', schema: LocationSchema }]),
  ],
  exports: [PaymentService],
  providers: [PaymentService, DeliveryService, LocationService],
  controllers: [PaymentController],
})
export class PaymentModule {}

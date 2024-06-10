import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { Deliveries } from './deliveries.entity';
import { LocationService } from '@modules/location/location.service';
import { LocationSchema } from '@modules/location/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deliveries]),
    MongooseModule.forFeature([{ name: 'Location', schema: LocationSchema }]),
  ],
  exports: [DeliveryService],
  providers: [DeliveryService, LocationService],
  controllers: [DeliveryController],
})
export class DeliveryModule {}

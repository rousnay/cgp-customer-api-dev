import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  DeliveryRequest,
  DeliveryRequestSchema,
} from './schemas/delivery-request.schema';
import { DeliveryService } from './services/delivery.service';
import { DeliveryController } from './delivery.controller';
import { Deliveries } from './deliveries.entity';
import { LocationService } from '@modules/location/location.service';
import { LocationSchema } from '@modules/location/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationModule } from '@modules/location/location.module';
import { DeliveryRequestService } from './services/delivery-request.service';
import { Orders } from '@modules/orders/entities/orders.entity';
import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
import { ConfigModule } from '@config/config.module';
import { NotificationService } from '@modules/notification/notification.service';
import { FirebaseAdminModule } from '@services/firebase-admin.module';
import { NotificationsModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    LocationModule,
    FirebaseAdminModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      Deliveries,
      DeliveryRequest,
      Orders,
      UserAddressBook,
    ]),
    MongooseModule.forFeature([
      { name: DeliveryRequest.name, schema: DeliveryRequestSchema },
    ]),
    // MongooseModule.forFeature([{ name: 'Location', schema: LocationSchema }]),
  ],
  exports: [DeliveryService, DeliveryRequestService],
  providers: [DeliveryService, DeliveryRequestService],
  controllers: [DeliveryController],
})
export class DeliveryModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@config/config.module';
import { PaymentService } from './services/payments.service'; // src
import { PaymentController } from './controllers/payments.controller';
import { DeliveryService } from '@modules/delivery/services/delivery.service';
import { FirebaseAdminModule } from '@services/firebase-admin.module';
import { NotificationsModule } from '@modules/notification/notification.module';
import { LocationModule } from '@modules/location/location.module';
import { DeliveryModule } from '@modules/delivery/delivery.module';
import { Deliveries } from '@modules/delivery/deliveries.entity';
import { Orders } from '@modules/orders/entities/orders.entity';
import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
import { PaymentMethodService } from './services/payment-method.service';
import { PaymentMethodController } from './controllers/payment-method.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeliveryRequest,
  DeliveryRequestSchema,
} from '@modules/delivery/schemas/delivery-request.schema';

@Module({
  imports: [
    ConfigModule,
    FirebaseAdminModule,
    NotificationsModule,
    LocationModule,
    DeliveryModule,
    TypeOrmModule.forFeature([Deliveries, Orders, UserAddressBook]),
    MongooseModule.forFeature([
      { name: DeliveryRequest.name, schema: DeliveryRequestSchema },
    ]),
  ],
  exports: [PaymentService],
  providers: [PaymentService, DeliveryService, PaymentMethodService],
  controllers: [PaymentMethodController, PaymentController],
})
export class PaymentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@config/config.module';
import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
import { UserAddressBookService } from '@modules/user-address-book/user-address-book-service';
import { PaymentService } from '@modules/payments/payments.service';
import { PaymentToken } from '@modules/payments/entities/payment-token.entity';
import { Deliveries } from '@modules/delivery/deliveries.entity';
import { Cart } from '@modules/cart/cart.entity';
import { Orders } from './entities/orders.entity';
import { OrderDetails } from './entities/order_details.entity';
import { OrderService } from './services/orders.service';
import { OrderController } from './controllers/orders.controller';
import { TransportationVehiclesService } from './services/transportation-vehicles.service';
import { TransportationOrdersService } from './services/transportation-orders.service';
import { TransportationCostCalculationService } from './services/transportation-cost-calculation.service';
import { TransportationVehiclesController } from './controllers/transportation-vehicles.controller';
import { TransportationCostCalculationController } from './controllers/transportation-cost-calculation.controller';
import { TransportationOrdersController } from './controllers/transportation-orders.controller';
import { DeliveryService } from '@modules/delivery/delivery.service';
import { FirebaseAdminModule } from '@services/firebase-admin.module';
import { NotificationsModule } from '@modules/notification/notification.module';
import { LocationModule } from '@modules/location/location.module';
import { DeliveryModule } from '@modules/delivery/delivery.module';
import { OrderNotificationService } from './services/order.notification.service';
import { OrderCancelReasonService } from './services/order-cancel-reason.service';
import { OrderCancelReason } from './entities/order-cancel-reason.entity';
import { OrderCancelReasonController } from './controllers/order-cancel-reason.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeliveryRequest,
  DeliveryRequestSchema,
} from '@modules/delivery/schemas/delivery-request.schema';
import { DeliveryRequestNotificationSchema } from '@modules/notification/notification.schema';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    FirebaseAdminModule,
    NotificationsModule,
    LocationModule,
    DeliveryModule,
    TypeOrmModule.forFeature([
      Orders,
      OrderDetails,
      Deliveries,
      Cart,
      TransportationVehiclesService,
      TransportationOrdersService,
      TransportationCostCalculationService,
      OrderCancelReason,
      UserAddressBook,
      UserAddressBookService,
      PaymentToken,
      PaymentService,
    ]),
    MongooseModule.forFeature([
      { name: DeliveryRequest.name, schema: DeliveryRequestSchema },
      {
        name: 'DeliveryRequestNotification',
        schema: DeliveryRequestNotificationSchema,
      },
    ]),
  ],
  exports: [OrderService],
  providers: [
    OrderService,
    TransportationVehiclesService,
    TransportationCostCalculationService,
    TransportationOrdersService,
    UserAddressBookService,
    PaymentService,
    DeliveryService,
    OrderCancelReasonService,
    OrderNotificationService,
  ],
  controllers: [
    OrderController,
    TransportationVehiclesController,
    TransportationCostCalculationController,
    TransportationOrdersController,
    OrderCancelReasonController,
  ],
})
export class OrderModule {}

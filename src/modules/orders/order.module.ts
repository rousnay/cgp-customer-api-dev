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
import { LocationService } from '@modules/location/location.service';
import { LocationSchema } from '@modules/location/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    TypeOrmModule.forFeature([
      Orders,
      OrderDetails,
      Deliveries,
      Cart,
      TransportationVehiclesService,
      TransportationOrdersService,
      TransportationCostCalculationService,
      UserAddressBook,
      UserAddressBookService,
      PaymentToken,
      PaymentService,
    ]),
    MongooseModule.forFeature([{ name: 'Location', schema: LocationSchema }]),
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
    LocationService
  ],
  controllers: [
    OrderController,
    TransportationVehiclesController,
    TransportationCostCalculationController,
    TransportationOrdersController,
  ],
})
export class OrderModule {}

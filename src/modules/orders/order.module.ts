import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../../config/config.module';
import { Orders } from './entities/orders.entity';
import { OrderDetails } from './entities/order_details.entity';
import { OrderService } from './services/orders.service';
import { OrderController } from './controllers/orders.controller';
import { Cart } from '../cart/cart.entity';
import { TransportationVehiclesService } from './services/transportation-vehicles.service';
import { TransportationOrdersService } from './services/transportation-orders.service';
import { TransportationCostCalculationService } from './services/transportation-cost-calculation.service';
import { UserAddressBook } from '../customers/entities/user-address-book.entity';
import { UserAddressBookService } from '../customers/services/user-address-book-service';
import { StripeService } from '../payments/stripe.service';
import { TransportationVehiclesController } from './controllers/transportation-vehicles.controller';
import { TransportationCostCalculationController } from './controllers/transportation-cost-calculation.controller';
import { TransportationOrdersController } from './controllers/transportation-orders.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    TypeOrmModule.forFeature([
      Orders,
      OrderDetails,
      Cart,
      TransportationVehiclesService,
      TransportationOrdersService,
      TransportationCostCalculationService,
      UserAddressBook,
      UserAddressBookService,
      StripeService,
    ]),
  ],
  exports: [OrderService],
  providers: [
    OrderService,
    TransportationVehiclesService,
    TransportationCostCalculationService,
    TransportationOrdersService,
    UserAddressBookService,
    StripeService,
  ],
  controllers: [
    OrderController,
    TransportationVehiclesController,
    TransportationCostCalculationController,
    TransportationOrdersController,
  ],
})
export class OrderModule {}

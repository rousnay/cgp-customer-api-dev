import { Module, OnModuleInit } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ConfigModule } from '@config/config.module';
import { MysqlModule } from '@database/mysql.module';
import { MongoModule } from '@database/mongo.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProductsModule } from '@modules/products/products.module';
import { WarehouseModule } from '@modules/warehouse/warehouses.module';
import { ApplicationModule } from '@modules/application/application.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { UserAddressBookModule } from '@modules/user-address-book/user-address-book-module';
import { GeoLocationModule } from '@modules/geolocation/geolocation.module';
import { SearchModule } from '@modules/search/search.module';
import { WishListModule } from '@modules/wishlist/wishlist.module';
import { CartModule } from '@modules/cart/cart.module';
import { OrderModule } from '@modules/orders/order.module';
import { DeliveryModule } from '@modules/delivery/delivery.module';
import { PaymentModule } from '@modules/payments/payments.module';
import { LocationModule } from '@modules/location/location.module';
import { NotificationsModule } from '@modules/notification/notification.module';
import { ChatModule } from '@modules/chat/chat.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ReviewModule } from '@modules/review/review.module';
import { VariablesService } from '@common/utils/variables.service';
import { setVariablesService } from '@common/utils/variables';
import { MongooseModule } from '@nestjs/mongoose';
import { AppVersion, AppVersionSchema } from './app-version.schema';

@Module({
  imports: [
    ConfigModule,
    MysqlModule,
    MongoModule,
    ApplicationModule,
    SearchModule,
    AuthModule,
    CustomersModule,
    UserAddressBookModule,
    WarehouseModule,
    ProductsModule,
    WishListModule,
    CartModule,
    OrderModule,
    DeliveryModule,
    LocationModule,
    ReviewModule,
    NotificationsModule,
    PaymentModule,
    GeoLocationModule,
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forFeature([
      { name: AppVersion.name, schema: AppVersionSchema },
    ]),
  ],
  providers: [AppService, VariablesService],
  controllers: [AppController],
})
// export class AppModule {}
export class AppModule implements OnModuleInit {
  constructor(private variablesService: VariablesService) {}
  onModuleInit() {
    setVariablesService(this.variablesService);
  }
}

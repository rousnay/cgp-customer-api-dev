import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WarehouseModule } from './warehouse/warehouses.module';
import { ApplicationModule } from './application/application.module';
// import { CategoriesModule } from './application/categories.module';
// import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { GeoLocationModule } from './geolocation/geolocation.module';
import { SearchModule } from './search/search.module';
import { WishListModule } from './wishlist/wishlist.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      // port: 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      // logging: ['query', 'error', 'schema', 'warn', 'info', 'log', 'migration'],
      synchronize: true,
      ssl: false,
      // ssl: {
      //   rejectUnauthorized: true,
      // },
    }),
    ApplicationModule,
    SearchModule,
    AuthModule,
    // UsersModule,
    CustomersModule,
    WarehouseModule,
    ProductsModule,
    WishListModule,
    CartModule,
    GeoLocationModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}

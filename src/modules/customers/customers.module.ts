import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule, HttpService } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@config/config.module';
import { CloudflareMediaService } from '@services/cloudflare-media-upload.service';
import { Preferences } from '@modules/application/entities/preferences.entity';
import { Customers } from './entities/customers.entity'; // Import your CustomerEntity
import { CustomersService } from './services/customers.service';
import { UserAddressBook } from './entities/user-address-book.entity';
import { CustomerController } from './controllers/customers.controller';
import { UserAddressBookController } from './controllers/user-address-book-controller';
import { UserAddressBookService } from './services/user-address-book-service';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Customers, UserAddressBook, Preferences]),
  ],
  exports: [CustomersService, UserAddressBookService],
  providers: [CustomersService, UserAddressBookService, CloudflareMediaService],
  controllers: [CustomerController, UserAddressBookController],
})
export class CustomersModule {}

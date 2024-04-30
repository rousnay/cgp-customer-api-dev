import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from './entities/customers.entity'; // Import your CustomerEntity
import { CustomersService } from './services/customers.service';
import { CustomerAddressBook } from './entities/customer-address-book.entity';
import { CustomerController } from './controllers/customers.controller';
import { Preferences } from 'src/application/entities/preferences.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { CustomerAddressBookController } from './controllers/customer-address-book-controller';
import { CustomerAddressBookService } from './services/customer-address-book-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customers, CustomerAddressBook, Preferences]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [CustomersService, CustomerAddressBookService],
  providers: [CustomersService, CustomerAddressBookService],
  controllers: [CustomerController, CustomerAddressBookController],
})
export class CustomersModule {}

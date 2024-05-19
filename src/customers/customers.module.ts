import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from './entities/customers.entity'; // Import your CustomerEntity
import { CustomersService } from './services/customers.service';
import { UserAddressBook } from './entities/user-address-book.entity';
import { CustomerController } from './controllers/customers.controller';
import { Preferences } from 'src/application/entities/preferences.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { UserAddressBookController } from './controllers/user-address-book-controller';
import { UserAddressBookService } from './services/user-address-book-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customers, UserAddressBook, Preferences]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [CustomersService, UserAddressBookService],
  providers: [CustomersService, UserAddressBookService],
  controllers: [CustomerController, UserAddressBookController],
})
export class CustomersModule {}

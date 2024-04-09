import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from './entities/customers.entity'; // Import your CustomerEntity
import { CustomersService } from './services/customers.service';
import { CustomerAddressBook } from './entities/customer_address_book.entity';
import { CustomerController } from './controllers/customers.controller';
import { Preferences } from 'src/application/entities/preferences.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customers, CustomerAddressBook, Preferences]),
  ],
  exports: [CustomersService],
  providers: [CustomersService],
  controllers: [CustomerController],
})
export class CustomersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from './entities/customers.entity'; // Import your CustomerEntity
import { CustomersService } from './services/customers.service';
import { CustomerController } from './controllers/customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customers])], // Import the entities
  exports: [CustomersService],
  providers: [CustomersService], // Import your service
  controllers: [CustomerController], // Optionally export service if needed in other modules
})
export class CustomersModule {}

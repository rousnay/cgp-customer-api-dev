import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomersService } from './services/customers.service';
// import { ExcelUploadService } from './services/excel-upload.service';

import { CustomerController } from './controllers/customers.controller';
// import { ExcelUploadController } from './controllers/excel-upload.controller';
import { Customers } from './entities/customers.entity'; // Import your CustomerEntity

@Module({
  imports: [TypeOrmModule.forFeature([Customers])], // Import the entities

  // exports: [CustomerService, ExcelUploadService],
  // providers: [CustomerService, ExcelUploadService], // Import your service
  // controllers: [CustomerController, ExcelUploadController], // Optionally export service if needed in other modules

  exports: [CustomersService],
  providers: [CustomersService], // Import your service
  controllers: [CustomerController], // Optionally export service if needed in other modules
})
export class CustomersModule {}

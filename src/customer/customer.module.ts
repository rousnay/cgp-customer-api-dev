import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerService } from './services/customer.service';
import { ExcelUploadService } from './services/excel-upload.service';

import { CustomerController } from './controllers/customer.controller';
import { ExcelUploadController } from './controllers/excel-upload.controller';
import { Customer } from './entities/customer.entity'; // Import your CustomerEntity

@Module({
  imports: [TypeOrmModule.forFeature([Customer])], // Import the entities
  providers: [CustomerService, ExcelUploadService], // Import your service
  exports: [CustomerService, ExcelUploadService],
  controllers: [CustomerController, ExcelUploadController], // Optionally export service if needed in other modules
})
export class CustomerModule {}

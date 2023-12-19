import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelUploadService } from './services/excel-upload.service';
import { ExcelUploadController } from './controllers/excel-upload.controller';
import { Customer } from './entities/customer.entity'; // Import your CustomerEntity

@Module({
  imports: [TypeOrmModule.forFeature([Customer])], // Import the entities
  providers: [ExcelUploadService], // Import your service
  exports: [ExcelUploadService],
  controllers: [ExcelUploadController], // Optionally export service if needed in other modules
})
export class CustomerModule {}

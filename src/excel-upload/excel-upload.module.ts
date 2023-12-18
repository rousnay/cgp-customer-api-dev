// excel-upload.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelUploadService } from './excel-upload.service';
import { ExcelUploadController } from './excel-upload.controller';
import { CustomerEntity } from './customer.entity'; // Import your CustomerEntity

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])], // Import the entities
  providers: [ExcelUploadService], // Import your service
  exports: [ExcelUploadService],
  controllers: [ExcelUploadController], // Optionally export service if needed in other modules
})
export class ExcelUploadModule {}

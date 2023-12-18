import { Injectable } from '@nestjs/common';
// import * as xlsx from 'xlsx';
import * as excel from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreateCustomerDto } from './create-customer.dto';
import { CustomerEntity } from './customer.entity'; // Update to your CustomerEntity

@Injectable()
export class ExcelUploadService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  // async uploadToDatabase(filePath: string): Promise<string> {
  //   const workbook = xlsx.readFile(filePath);
  //   const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //   const data: CreateCustomerDto[] = xlsx.utils.sheet_to_json(sheet);

  //   const entities = data.map((row) => this.customerRepository.create(row));

  //   // await this.customerRepository.save(entities); // Save the entity to the database

  //   try {
  //     await this.customerRepository.save(entities);
  //     return 'Data uploaded successfully!';
  //   } catch (error) {
  //     throw new Error('Failed to upload data');
  //   }
  // }

  async uploadToDatabase(filePath: string) {
    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1); // Get the first sheet

    const rows = worksheet.getSheetValues(); // Fetch all data from the sheet

    console.log(rows);

    // Process rows and save to database
    for (const row of rows.slice(1)) {
      const entity = new CustomerEntity(); // Create an instance of your TypeORM Entity
      // entity.id = row[0]; // Assign values from the row to your entity properties
      entity.firstName = row[6] ?? ' ';
      entity.middleName = row[7] ?? ' ';
      entity.lastName = row[5] ?? ' ';
      entity.sex = row[27] ?? ' ';
      entity.birthDate = row[28] ?? ' ';
      entity.streetName = row[12] ?? ' ';
      // ... Assign other properties

      await this.customerRepository.save(entity); // Save the entity to the database
    }

    return 'Data uploaded successfully!';
  }
}

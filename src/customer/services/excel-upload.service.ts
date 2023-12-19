import { Injectable } from '@nestjs/common';
import * as excel from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Customer } from '../entities/customer.entity'; // Update to your CustomerEntity

@Injectable()
export class ExcelUploadService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async uploadToDatabase(filePath: string): Promise<string> {
    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1); // Get the first sheet
    const rows = worksheet.getSheetValues(); // Fetch all data from the sheet

    // Process rows and save to database
    for (const row of rows.slice(2)) {
      //slice(2) to skip the header
      const dto = new CreateCustomerDto();

      dto.sosVoterId = row[1] ?? ' ';
      dto.idNumber = row[2] ?? ' ';
      dto.voterStatus = row[3] ?? ' ';
      dto.partyCode = row[4] ?? ' ';

      dto.firstName = row[6] ?? ' ';
      dto.middleName = row[7] ?? ' ';
      dto.lastName = row[5] ?? ' ';
      dto.sex = row[27] ?? ' ';
      dto.birthDate = row[28] ?? ' ';

      dto.streetName = row[12] ?? ' ';
      dto.streetNumber = row[9] ?? ' ';
      dto.streetType = row[13] ?? ' ';
      dto.city = row[17] ?? ' ';
      dto.zipCode = row[18] ?? ' ';
      // ... Assign other properties

      const entity = this.customerRepository.create(dto);
      console.log(entity);
      await this.customerRepository.save(entity); // Save the entity to the database
    }
    return 'Data uploaded successfully!';
  }
}

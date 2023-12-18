// upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExcelUploadService } from './excel-upload.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as excel from 'exceljs';

@Controller('upload')
@ApiTags('upload')
export class ExcelUploadController {
  constructor(private readonly excelUploadService: ExcelUploadService) {}

  @Post('excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Destination folder for uploaded files
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // comment: { type: 'string' },
        // outletId: { type: 'integer' },
        file: {
          // 👈 this property
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadXlsxFile(@UploadedFile() file: Express.Multer.File) {
    // 'file' contains the uploaded file, handle it in the service
    const filePath = file.path; // Path to the uploaded file
    console.log(filePath);
    return this.excelUploadService.uploadToDatabase(filePath);
  }
  // async uploadXlsxFile(@UploadedFile() file: Express.Multer.File) {
  //   const workbook = new excel.Workbook();
  //   await workbook.xlsx.readFile(file.path);
  //   const sheet = workbook.getWorksheet(1); // Get the first sheet
  //   const data = sheet.getSheetValues(); // Fetch all data from the sheet

  //   // Pass the data to the service for further processing
  //   return this.excelUploadService.processExcelData(data);
  // }
}

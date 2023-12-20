import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExcelUploadService } from '../services/excel-upload.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('upload')
@ApiTags('Excel Upload')
export class ExcelUploadController {
  constructor(private readonly excelUploadService: ExcelUploadService) {}

  @Post('excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp', // Destination folder for uploaded files
        filename: (req, file, callback) => {
          const originalName = file.originalname;
          const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
          const time = new Date().toLocaleTimeString('en-US', {
            hour12: false,
          }); // Current time in HH:MM:SS format
          const formattedTime = time.replace(/:/g, '-'); // Replacing colons with underscores for HH_MM_SS
          const randomNumber = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number

          const fileNameParts = [
            originalName.replace(/\.[^/.]+$/, ''), // File name without extension
            date,
            formattedTime,
            randomNumber.toString(),
          ];

          const finalFileName =
            fileNameParts.join('_') + extname(file.originalname); // Join parts with underscores
          return callback(null, finalFileName);
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
}

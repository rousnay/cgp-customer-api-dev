import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

export const profileImageInterceptor = FileInterceptor('profile_image', {
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
      callback(null, finalFileName);
    },
  }),
});

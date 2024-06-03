import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/customers.entity'; // Adjust the import path if necessary

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @IsEmpty({ each: true })
  @ApiProperty({ description: 'First name', required: false })
  first_name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Last name', required: false })
  last_name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Email address', required: false })
  email?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Date of birth', type: Date, required: false })
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Gender', enum: Gender, required: false })
  gender?: Gender | null;

  // @IsOptional()
  // @ApiProperty({
  //   type: 'string',
  //   format: 'binary',
  //   required: false,
  // })
  // profile_image: Express.Multer.File;

  @IsOptional()
  @ApiProperty({ description: 'Active status', required: false })
  is_active?: boolean;
}

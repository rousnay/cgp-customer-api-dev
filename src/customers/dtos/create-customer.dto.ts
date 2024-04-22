import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/customers.entity'; // Adjust the import path if necessary

export class CreateCustomerDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  user_id: number;

  @IsString()
  @ApiProperty()
  @MaxLength(50)
  first_name: string;

  @IsString()
  @ApiProperty()
  @MaxLength(50)
  last_name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  @MaxLength(50)
  email?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: Date, required: false })
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: Gender, enumName: 'Gender', required: false })
  gender?: Gender | null;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  profile_image_url?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: Date, required: false })
  registration_date?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: Date, required: false })
  last_login?: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  is_active?: boolean;
}

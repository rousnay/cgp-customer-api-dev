import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import { Gender } from '../entities/customers.entity';
export class CustomersQueryParamsDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  customer_id: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  first_name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  last_name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: Gender, enumName: 'Gender', required: false })
  gender: string; // Gender enum is defined elsewhere

  @IsOptional()
  @ApiProperty({ required: false })
  is_active: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  page?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  limit?: number;
}

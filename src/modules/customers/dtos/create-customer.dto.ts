import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
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
}

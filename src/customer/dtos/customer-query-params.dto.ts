import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiQuery } from '@nestjs/swagger';
export class CustomerQueryParamsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sosVoterId: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  idNumber: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  voterStatus: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  partyCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  middleName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sex: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  birthDate: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  streetName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  streetNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  streetType: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  city: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  zipCode: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  page?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  limit?: number;
}

import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCustomerDto {
  @IsString()
  @ApiProperty()
  sosVoterId: string;

  @IsNumber()
  @IsNotEmpty()
  @MaxLength(25)
  @ApiProperty()
  idNumber: number;

  @IsString()
  @ApiProperty()
  voterStatus: string;

  @IsString()
  @ApiProperty()
  partyCode: string;

  @IsString()
  @ApiProperty()
  firstName: string;

  @IsString()
  @ApiProperty()
  middleName: string;

  @IsString()
  @ApiProperty()
  lastName: string;

  @IsString()
  @ApiProperty()
  sex: string;

  @IsString()
  @ApiProperty()
  birthDate: string;

  @IsString()
  @ApiProperty()
  streetName: string;

  @IsString()
  @ApiProperty()
  streetNumber: string;

  @IsString()
  @ApiProperty()
  streetType: string;

  @IsString()
  @ApiProperty()
  city: string;

  @IsString()
  @ApiProperty()
  zipCode: string;
}

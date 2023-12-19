import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';
export class CreateCustomerDto {
  @IsString()
  sosVoterId: string;

  @IsNumber()
  @IsNotEmpty()
  @MaxLength(25)
  idNumber: number;

  @IsString()
  voterStatus: string;

  @IsString()
  partyCode: string;

  @IsString()
  firstName: string;

  @IsString()
  middleName: string;

  @IsString()
  lastName: string;

  @IsString()
  sex: string;

  @IsString()
  birthDate: string;

  @IsString()
  streetName: string;

  @IsString()
  streetNumber: string;

  @IsString()
  streetType: string;

  @IsString()
  city: string;

  @IsString()
  zipCode: string;
}

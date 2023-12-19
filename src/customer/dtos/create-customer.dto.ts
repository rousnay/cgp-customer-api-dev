import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateCustomerDto {
  @IsString()
  sosVoterId: string;

  @IsString()
  idNumber: string;

  @IsString()
  voterStatus: string;

  @IsString()
  partyCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
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

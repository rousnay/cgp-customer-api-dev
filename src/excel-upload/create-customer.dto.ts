import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateCustomerDto {
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
}

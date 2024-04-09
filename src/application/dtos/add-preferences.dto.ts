import { IsNotEmpty, IsString } from 'class-validator';

export class AddPreferencesDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

import { IsString } from 'class-validator';

export class UsersCreateDTO {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  username: string;

  @IsString()
  password: string;
}

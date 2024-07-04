import { IsNotEmpty } from 'class-validator';

export class SetDefaultPaymentMethodDto {
  @IsNotEmpty()
  pmID: string;
}

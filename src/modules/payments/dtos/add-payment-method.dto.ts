import { IsNotEmpty } from "class-validator";

export class AddPaymentMethodDto {
  @IsNotEmpty()
  pmID: string;
  @IsNotEmpty()
  isDefault: boolean;
}

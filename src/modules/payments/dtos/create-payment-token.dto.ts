import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentTokenDto {
  @ApiProperty()
  readonly cardNumber: string;
  @ApiProperty()
  readonly expMonth: number;
  @ApiProperty()
  readonly expYear: number;
  @ApiProperty()
  readonly cvc: string;
  @ApiProperty()
  readonly customerId: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateTransportationOrderDto {
  @ApiProperty({ required: false })
  vehicle_type_id: number;

  @ApiProperty({ required: false })
  pickup_address_id?: number;

  @ApiProperty({ required: false })
  shipping_address_id?: number;

  @ApiProperty({ required: false })
  total_cost: number;

  @ApiProperty({ required: false })
  discount: number;

  @ApiProperty({ required: false })
  GST: number;

  @ApiProperty({ required: false })
  payable_amount: number;
}

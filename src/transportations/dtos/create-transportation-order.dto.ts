import { ApiProperty } from '@nestjs/swagger';
import { CreateCustomerAddressDto } from '../../customers/dtos/create-customer-address.dto';

export class CreateTransportationOrderDto {
  @ApiProperty({ type: CreateCustomerAddressDto, required: false })
  pickup_address?: CreateCustomerAddressDto;

  @ApiProperty({ type: CreateCustomerAddressDto, required: false })
  shipping_address?: CreateCustomerAddressDto;

  @ApiProperty({ required: false })
  vehicle_type_id: number;

  @ApiProperty({ required: false })
  total_cost: number;

  @ApiProperty({ required: false })
  gst: number;

  @ApiProperty({ required: false })
  payable_amount: number;
}

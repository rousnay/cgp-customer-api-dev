import { CreateUserAddressDto } from '@modules/user-address-book/create-user-address.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class OrderProductDto {
  @ApiProperty()
  product_id: number;

  // @ApiProperty({ required: false })
  // variant_id?: number | null; // Nullable variant_id

  @ApiProperty({ required: false })
  offer_id?: number | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ required: false })
  regular_price: number | 0;

  @ApiProperty({ required: false })
  sales_price: number | 0;
}

export class CreateOrderDto {
  @ApiProperty()
  warehouse_id: number;

  @IsOptional()
  @ApiProperty({ required: false })
  warehouse_branch_id: number;

  @IsOptional()
  @ApiProperty({ required: false })
  billing_address_id?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  shipping_address_id?: number;

  @IsOptional()
  @ApiProperty({ type: CreateUserAddressDto, required: false })
  shipping_address?: CreateUserAddressDto;

  @IsOptional()
  @ApiProperty({ required: false })
  distance?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  duration?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  vehicle_type_id?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  delivery_charge?: number | 0;

  @IsOptional()
  @ApiProperty({ type: [OrderProductDto] })
  products: OrderProductDto[];
}

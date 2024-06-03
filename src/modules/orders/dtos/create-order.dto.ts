import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ required: false })
  shipping_address_id?: number | null; // Nullable shipping_address_id

  @ApiProperty({ required: false })
  billing_address_id?: number | null; // Nullable billing_address_id

  @ApiProperty({ type: [OrderProductDto] })
  products: OrderProductDto[];
}

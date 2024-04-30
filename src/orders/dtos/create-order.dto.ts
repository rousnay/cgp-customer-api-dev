import { ApiProperty } from '@nestjs/swagger';

export class OrderProductDto {
  @ApiProperty()
  product_id: number;

  // @ApiProperty({ required: false })
  // variant_id?: number | null; // Nullable variant_id

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  regular_price: number;

  @ApiProperty()
  sales_price: number;

  @ApiProperty({ required: false })
  offer_id?: number | null; // Nullable offer_id
}

export class CreateOrderDto {
  // @ApiProperty()
  // customer_id: number;

  @ApiProperty()
  warehouse_id: number;

  @ApiProperty()
  total_item: number;

  @ApiProperty()
  total_price: number;

  @ApiProperty({ required: false })
  discount?: number | null;

  // @ApiProperty()
  // vat: number;

  @ApiProperty()
  payable_amount: number;

  @ApiProperty({ required: false })
  delivery_id?: number | null; // Nullable delivery_id

  @ApiProperty({ required: false })
  shipping_address_id?: number | null; // Nullable shipping_address_id

  @ApiProperty({ required: false })
  billing_address_id?: number | null; // Nullable billing_address_id

  @ApiProperty({ required: false })
  payment_id?: number | null; // Nullable payment_id

  @ApiProperty({ type: [OrderProductDto] })
  products: OrderProductDto[];
}

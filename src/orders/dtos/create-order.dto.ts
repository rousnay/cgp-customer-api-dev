export class CreateOrderDto {
  customer_id: number;
  warehouse_id: number;
  total_item: number;
  total_price: number;
  discount: number;
  vat: number;
  payable_amount: number;
  order_status: OrderStatus; // Import OrderStatus enum from order.entity.ts
  products: OrderProductDto[]; // Define OrderProductDto
}

export class OrderProductDto {
  product_id: number;
  variant_id?: number;
  quantity: number;
  regular_price: number;
  sales_price: number;
  offer_id?: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}
    
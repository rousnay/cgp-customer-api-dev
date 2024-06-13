export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderType {
  PRODUCT_AND_TRANSPORT = 'product_and_transport',
  TRANSPORTATION_ONLY = 'transportation_only',
  WAREHOUSE_TRANSPORTATION = 'warehouse_transportation',
}
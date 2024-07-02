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

export enum OrderCancelReasonType {
  TRANSPORTATION_ORDER_CANCELLED_BY_CUSTOMER = 'transportation_order_cancelled_by_customer',
  TRANSPORTATION_ORDER_CANCELLED_BY_WAREHOUSE = 'transportation_order_cancelled_by_warehouse',
  TRANSPORTATION_ORDER_CANCELLED_BY_RIDER = 'transportation_order_cancelled_by_rider',
  TRANSPORTATION_ORDER_CANCELLED_BY_ADMIN = 'transportation_order_cancelled_by_admin',
  PRODUCT_ORDER_CANCELLED_BY_CUSTOMER = 'product_order_cancelled_by_customer',
  PRODUCT_ORDER_CANCELLED_BY_WAREHOUSE = 'product_order_cancelled_by_warehouse',
  PRODUCT_ORDER_CANCELLED_BY_ADMIN = 'product_order_cancelled_by_admin',
}

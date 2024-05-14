import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  OTHER = 'other',
}

// export enum PaymentStatus {
//   UNPAID = 'unpaid',
//   PAID = 'paid',
//   PARTIAL_PAID = 'partial_paid',
//   FAILED = 'failed',
//   CANCELLED = 'cancelled',
//   REFUNDED = 'refunded',
//   PARTIAL_REFUNDED = 'partial_refunded',
// }

@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: OrderType, default: OrderType.OTHER })
  order_type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  order_status: OrderStatus;

  @Column()
  customer_id: number;

  @Column()
  warehouse_id: number;

  @Column({ nullable: true })
  shipping_address_id: number;

  @Column({ nullable: true })
  billing_address_id: number;

  @Column({ nullable: true })
  vehicle_type_id: number;

  @Column({ nullable: true })
  payment_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gst: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_charge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payable_amount: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  accepted_at: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  cancelled_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;
}

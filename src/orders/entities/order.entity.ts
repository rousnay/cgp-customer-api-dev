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
  DELIVERED = 'delivered',
}

// export enum PaymentMethod {
//   CREDIT_CARD = 'credit_card',
//   CASH_ON_DELIVERY = 'cash_on_delivery',
//   BANK_TRANSFER = 'bank_transfer',
//   PAYPAL = 'paypal',
//   OTHER = 'other',
// }

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // order_type: string;

  @Column()
  customer_id: number;

  @Column()
  warehouse_id: number;

  @Column({ nullable: true })
  delivery_id: number;

  @Column({ nullable: true })
  shipping_address_id: number;

  @Column({ nullable: true })
  billing_address_id: number;

  @Column({ nullable: true })
  payment_id: number;

  @Column()
  total_item: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  vat: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  payable_amount: number;

  // @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.OTHER })
  // payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  order_status: OrderStatus;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;
}

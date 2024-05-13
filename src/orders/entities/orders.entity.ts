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

export enum OrderType {
  CUSTOMER = 'customer',
  WAREHOUSE = 'warehouse',
  CGP = 'cgp',
  OTHER = 'other',
}

// export enum PaymentMethod {
//   CREDIT_CARD = 'credit_card',
//   CASH_ON_DELIVERY = 'cash_on_delivery',
//   BANK_TRANSFER = 'bank_transfer',
//   PAYPAL = 'paypal',
//   OTHER = 'other',
// }

@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // order_type: string;

  @Column()
  customer_id: number;

  @Column()
  warehouse_id: number;

  @Column({ nullable: true })
  shipping_address_id: number;

  @Column({ nullable: true })
  billing_address_id: number;

  @Column({ nullable: true })
  payment_id: number;

  // @Column({ nullable: true })
  // total_item: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vat: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_charge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payable_amount: number;

  // @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.OTHER })
  // payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: OrderType, default: OrderType.OTHER })
  order_type: OrderType;

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

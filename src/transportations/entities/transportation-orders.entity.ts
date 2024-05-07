import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransportationOrderStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  ONGOING = 'ongoing',
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
export class TransportationOrders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  vehicle_type_id: number;

  @Column({ nullable: true })
  delivery_id: number;

  @Column({ nullable: true })
  pickup_address_id: number;

  @Column({ nullable: true })
  shipping_address_id: number;

  @Column({ nullable: true })
  payment_id: number;

  @Column({ nullable: true })
  init_distance: number;

  @Column({ nullable: true })
  init_duration: number;

  @Column({ nullable: true })
  final_distance: number;

  @Column({ nullable: true })
  final_duration: number;

  // @Column({ nullable: true })
  // total_item: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gst: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payable_amount: number;

  // @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.OTHER })
  // payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: TransportationOrderStatus,
    default: TransportationOrderStatus.PENDING,
  })
  order_status: TransportationOrderStatus;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  picked_up_at: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  delivered_at: Date;

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
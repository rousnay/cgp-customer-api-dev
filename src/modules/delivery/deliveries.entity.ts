import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ShippingStatus } from '@common/enums/delivery.enum';

@Entity()
export class Deliveries {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.WAITING,
  })
  shipping_status: ShippingStatus;

  @Column({ nullable: true })
  rider_id: number;

  @Column({ nullable: true })
  customer_id: number;

  @Column({ nullable: true })
  warehouse_id: number;

  @Column({ nullable: true })
  order_id: number;

  @Column({ nullable: true })
  vehicle_id: number;

  @Column({ nullable: true })
  vehicle_type_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  init_distance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  final_distance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  init_duration: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  final_duration: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rider_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_charge: number;

  @Column({ nullable: true })
  cancel_reason_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @Column({
    nullable: true,
  })
  accepted_at: Date;

  @Column({
    nullable: true,
  })
  reached_pickup_point_at: Date;

  @Column({
    nullable: true,
  })
  picked_up_at: Date;

  @Column({
    nullable: true,
  })
  reached_delivery_point_at: Date;

  @Column({
    nullable: true,
  })
  delivered_at: Date;

  @Column({
    nullable: true,
  })
  cancelled_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;
}

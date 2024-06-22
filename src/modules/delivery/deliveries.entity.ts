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
  delivery_charge: number;

  @Column({ nullable: true })
  init_distance: number;

  @Column({ nullable: true })
  init_duration: number;

  @Column({ nullable: true })
  final_distance: number;

  @Column({ nullable: true })
  final_duration: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @CreateDateColumn({
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

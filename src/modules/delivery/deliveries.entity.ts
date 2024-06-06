import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ShippingStatus } from '@common/enums/delivery.enum';


// export enum OrderType {
//   PRODUCT_AND_TRANSPORT = 'product_and_transport',
//   TRANSPORTATION_ONLY = 'transportation_only',
//   OTHER = 'other',
// }

@Entity()
export class Deliveries {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ type: 'enum', enum: OrderType, default: OrderType.OTHER })
  // order_type: OrderType;

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
  accepted_at: Date;

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
  cancelled_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;
}

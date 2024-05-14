import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ShippingStatus {
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity()
export class Deliveries {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.ACCEPTED,
  })
  ShippingStatus: ShippingStatus;

  @Column({ nullable: true })
  rider_id: number;

  @Column({ nullable: true })
  customer_id: number;

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

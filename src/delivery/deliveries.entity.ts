import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DeliveryType {
  CGP_PRODUCT = 'cgp_product',
  TRANSPORTATION = 'transportation',
  OTHER = 'other',
}

@Entity()
export class Deliveries {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: DeliveryType,
    default: DeliveryType.OTHER,
  })
  delivery_type: DeliveryType;

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

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;
}

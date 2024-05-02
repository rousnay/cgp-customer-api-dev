import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customers } from './customers.entity';

export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

@Entity()
export class CustomerAddressBook extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  // @ManyToOne(() => Customers, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'customer_id' })
  // customer: Customers;

  @Column({ length: 50, nullable: true })
  first_name: string;

  @Column({ length: 50, nullable: true })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone_number_1: string;

  @Column({ length: 20, nullable: true })
  phone_number_2: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  postal_code: string;

  @Column({ length: 50, nullable: true })
  country_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: AddressType,
    nullable: true,
    default: null,
  })
  address_type: AddressType;

  @Column({ default: false })
  is_default: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
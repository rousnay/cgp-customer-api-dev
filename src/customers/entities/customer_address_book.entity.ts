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

  // @Column()
  // customer_id: number;

  @ManyToOne(() => Customers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customers;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone_number_1: string;

  @Column({ length: 20, nullable: true })
  phone_number_2: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50 })
  state: string;

  @Column({ length: 20 })
  postal_code: string;

  @Column({ length: 50 })
  country_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: AddressType,
    nullable: true,
    //default: AddressType.SHIPPING
  })
  address_type: AddressType;

  @Column({ default: false })
  is_default: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

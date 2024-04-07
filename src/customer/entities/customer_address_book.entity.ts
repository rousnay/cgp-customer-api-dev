import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
// import { User } from './user.entity';

@Entity()
export class CustomerAddressBook extends BaseEntity {
  @PrimaryGeneratedColumn()
  address_id: number;

  // @ManyToOne(() => User, (user) => user.addresses)
  // customer: c;

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

  // @Column({ enum: ['shipping', 'billing'], nullable: true })
  // address_type: string;

  @Column({ length: 50 })
  address_type: string;

  @Column({ default: false })
  is_default: boolean;
}

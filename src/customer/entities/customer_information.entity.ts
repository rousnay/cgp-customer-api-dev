import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CustomerInformation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  user_id: number;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone_number: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  profile_image_url: string;

  @CreateDateColumn({ type: 'timestamp' })
  registration_date: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  last_login: Date;

  @Column({ default: true })
  is_active: boolean;
}

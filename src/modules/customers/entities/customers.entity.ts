import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

// import { Preferences } from 'src/application/entities/preferences.entity';
import { Preferences } from '../../application/entities/preferences.entity';
import { Gender } from '@common/enums/user.enum';

@Entity()
export class Customers extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true, length: 50 })
  first_name: string;

  @Column({ nullable: true, length: 50 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    // default: Gender.OTHER
  })
  gender: Gender | null; // Define the column as nullable in the entity

  @Column({ nullable: true })
  profile_image_cf_media_id: number;

  // Define the relationship with preferences
  @ManyToMany(() => Preferences, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'customers_preferences' })
  preferences: Preferences[];

  @CreateDateColumn({ type: 'timestamp' })
  registration_date: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  last_login: Date;

  @Column({ default: true })
  is_active: boolean;

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

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted_at: Date;
}

import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Preferences } from 'src/application/entities/preferences.entity';

// import { Users } from 'src/users/users.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
@Entity()
export class Customers extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @OneToOne(() => Users, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'user_id' })
  // user: Users;

  @Column()
  user_id: number;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone_number: string;

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
  profile_image_url: string;

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
    // precision: 6,
    nullable: true,
    // default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    // precision: 6,
    nullable: true,
    // default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}

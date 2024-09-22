import { Gender, UserType } from '@common/enums/user.enum';
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

@Entity()
export class UserDeleted extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  user_type: UserType;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  password: string; // Add the password field

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({ nullable: true })
  profile_image_cf_media_id: number;

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
}

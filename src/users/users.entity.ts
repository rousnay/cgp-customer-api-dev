import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  WAREHOUSE_OWNER = 'warehouse_owner',
  RIDER = 'rider',
}

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) // Specify the existing id column type
  id: number;

  @Column({ length: 255, nullable: false, collation: 'utf8mb4_general_ci' })
  name: string;

  @Column({ length: 255, nullable: true, collation: 'utf8mb4_general_ci' })
  nickname: string;

  @Column({ length: 255, nullable: false, collation: 'utf8mb4_general_ci' })
  email: string;

  @Column({ length: 20, nullable: true, collation: 'utf8mb4_general_ci' })
  phone: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    collation: 'utf8mb4_general_ci',
  })
  email_verified_at: Date;

  @Column({ length: 255, nullable: false, collation: 'utf8mb4_general_ci' })
  password: string;

  @Column({ type: 'tinyint', width: 1, nullable: false, default: 1 })
  active: boolean;

  @Column({ length: 100, nullable: true, collation: 'utf8mb4_general_ci' })
  remember_token: string;

  @Column({
    type: 'enum',
    // collation: 'utf8mb4_general_ci',
    // nullable: false,
    enum: UserType,
    default: UserType.USER,
  })
  user_type: UserType;

  @Column({ type: 'int', nullable: true })
  role_id: number;

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

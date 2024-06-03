import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  product_id: number;

  @Column()
  quantity: number;

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

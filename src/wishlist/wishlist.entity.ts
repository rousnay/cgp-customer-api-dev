import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class WishList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  product_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    // precision: 6,
    nullable: true,
    // default: () => 'CURRENT_TIMESTAMP(6)',
  })
  added_at: Date;
}

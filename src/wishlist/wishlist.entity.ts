import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class WishList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  product_id: number;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}

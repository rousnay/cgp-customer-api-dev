import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class OrderDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  product_id: number;

  @Column({ nullable: true })
  variant_id: number;

  @Column({ nullable: true })
  offer_id: number;

  @Column()
  product_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  regular_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sales_price: number;

  // @CreateDateColumn({
  //   type: 'timestamp',
  //   nullable: true,
  // })
  // created_at: Date;

  // @UpdateDateColumn({
  //   type: 'timestamp',
  //   nullable: true,
  // })
  // updated_at: Date;
}

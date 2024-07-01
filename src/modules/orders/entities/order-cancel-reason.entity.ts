import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderCancelReasonType } from '@common/enums/order.enum';

@Entity('order_cancel_reasons')
export class OrderCancelReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderCancelReasonType,
    default: OrderCancelReasonType.TRANSPORTATION_ORDER_CANCELLED_BY_USER,
  })
  reason_type: OrderCancelReasonType;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

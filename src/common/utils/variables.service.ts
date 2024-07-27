import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class VariablesService {
  constructor(private entityManager: EntityManager) {}

  async getTradebarFeeId(): Promise<number | null> {
    const result = await this.entityManager
      .createQueryBuilder()
      .select('tf.id')
      .from('tradebar_fees', 'tf')
      .where('status = :status', { status: true })
      .getRawOne();
    return result ? result.id : null;
  }

  async getTradebarFeePercentage(): Promise<number> {
    const result = await this.entityManager
      .createQueryBuilder()
      .select('tf.percentage')
      .from('tradebar_fees', 'tf')
      .where('status = :status', { status: true })
      .getRawOne();
    return Number(result ? result.percentage : 0);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AppVariables } from '@common/utils/variables';

@Injectable()
export class AppService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getHelloAsync(): Promise<string> {
    const rawQuery = `
        SELECT COUNT(*) AS total_customers
        FROM customers;
        `;

    const result = await this.entityManager.query(rawQuery);

    if (result.length === 0) {
      return null;
    }

    const tradebarFeePercentage = await AppVariables.tradebarFee.percentage;

    return (
      'Total customers: ' +
      result[0].total_customers +
      ', Tradebar Fee ' +
      tradebarFeePercentage +
      '%'
    );
  }
}

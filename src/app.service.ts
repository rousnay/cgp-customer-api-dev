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

  async appVersion(): Promise<any> {
    return {
      current: 'V_1',
      version: '1.0.4',
      android_test_version: '1.0.5',
      ios_version: '1.0.7',
      ios_test_version: '1.0.8',
      enable: false,
      majorMsg: {
        title: 'Update App',
        msg: 'New Version Available. Please Update.',
        button: 'Download',
        url: {
          apk: 'https://play.google.com/store/apps/details?id=com.tradebar.customer',
          ios: 'https://apps.apple.com/gb/app/tradebar-customer/id6730116636',
        },
      },
      minorMsg: {
        title: 'New Version Coming soon...',
        msg: 'We sincerely apologize for the inconvenience. You can place an order through our website.',
        button: 'Ok',
        url: null,
      },
    };
  }
}

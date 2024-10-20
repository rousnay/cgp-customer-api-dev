import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AppVariables } from '@common/utils/variables';
import { AppVersion } from './app-version.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectModel(AppVersion.name) private appVersionModel: Model<AppVersion>,
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
      android_version: '1.0.4',
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

  // Fetch the app version from the database
  // Fetch the app version by app_name (which is inside the data object)
  async getAppVersion(): Promise<AppVersion> {
    const appVersion = await this.appVersionModel.findOne({
      'data.app_name': 'Tradebar Customer',
    });
    if (!appVersion) {
      throw new NotFoundException(
        `App version with app_name 'Tradebar Customer' not found`,
      );
    }
    return appVersion;
  }

  async updateAppVersion(updateData: any): Promise<AppVersion> {
    // Check if app_name is present in the update data
    if (!updateData.app_name) {
      throw new BadRequestException(
        'app_name property is required in updateData',
      );
    }

    const updatedAppVersion = await this.appVersionModel.findOneAndUpdate(
      { 'data.app_name': 'Tradebar Customer' }, // Query to find the app version
      { $set: { data: updateData } }, // Update operation
      { new: true, upsert: true }, // Return the updated document and create if not found
    );

    return updatedAppVersion;
  }
}

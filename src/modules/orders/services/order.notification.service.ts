import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NotificationService } from '@modules/notification/notification.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class OrderNotificationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly notificationService: NotificationService,
  ) {}

  async getUserDeviceTokensByWarehouseId(
    modelId: number,
  ): Promise<{ userId: number; tokens: string[] }[]> {
    const rawQuery = `
        SELECT u.id as userId, GROUP_CONCAT(udt.device_token SEPARATOR ',') as tokens
            FROM users u
            INNER JOIN user_device_tokens udt ON u.id = udt.user_id
            WHERE u.model_id = ? AND u.user_type = 'warehouse_owner'
            GROUP BY u.id;
        `;

    const result = await this.entityManager.query(rawQuery, [modelId]);

    if (result.length === 0) {
      return null;
    }

    return result.map((row) => ({
      userId: row.userId,
      tokens: row.tokens ? row.tokens.split(',') : [],
    }));
  }

  async sendOrderNotification(order: any) {
    // console.log(order);
    const warehouseId = order?.warehouse_id;
    console.log('warehouseId', warehouseId);
    const results = await this.getUserDeviceTokensByWarehouseId(warehouseId);

    console.log('results', results);

    const customer = this.request['user'];
    const title = 'New Order Placed';
    const message = `'You have a new order from ' + requestedByUserName`;
    const orderByUserId = customer?.user_id;
    const orderByUserName = customer?.first_name + ' ' + customer?.last_name;
    const data = {
      target: 'warehouse',
      type: 'new_order',
      warehouseId: warehouseId.toString(),
      orderId: order?.id.toString(),
      orderByUserId: orderByUserId.toString(),
      orderByUserName: orderByUserName,
      url: 'https://cgp-warehouse.vercel.app/orders/' + order?.id,
    };
    for (const warehouse of results) {
      console.log('warehouse', warehouse);

      await this.notificationService.sendAndStoreNotification(
        warehouse.userId,
        warehouse.tokens,
        title,
        message,
        { ...data },
      );

      //   for (const deviceToken of warehouse.tokens) {
      //     await this.notificationService.sendAndStoreNotification(
      //       warehouse.userId,
      //       deviceToken,
      //       title,
      //       message,
      //       { ...data, },
      //     );
      //   }
    }
  }
}

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

  async sendOrderNotification(order: any, status: string) {
    // console.log(order);
    const warehouseId = order?.warehouse_id;
    console.log('warehouseId', warehouseId);
    const results = await this.getUserDeviceTokensByWarehouseId(warehouseId);

    console.log('results', results);

    if (results === null) {
      return (
        'No device tokens found for warehouse with id ' +
        warehouseId +
        'to send notification'
      );
    }

    const customer = this.request['user'];
    const orderByUserId = customer?.user_id;
    const orderByUserName = customer?.first_name + ' ' + customer?.last_name;

    let title: string;
    let message: string;

    if (status === 'order_placed') {
      title = 'New Order Placed';
      message = 'You have a new order from ' + orderByUserName;
    } else if (status === 'order_cancelled') {
      title = 'Order Cancelled';
      message = 'Your order has been cancelled by ' + orderByUserName;
    }

    const data = {
      target: 'warehouse',
      type: 'order',
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

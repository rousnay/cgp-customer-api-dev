import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NotificationService } from '@modules/notification/notification.service';
import { REQUEST } from '@nestjs/core';
import { AppConstants } from '@common/constants/constants';
import { OrderStatus, OrderType } from '@common/enums/order.enum';
import { ShippingStatus } from '@common/enums/delivery.enum';

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

  async getUserDeviceTokensByRiderId(
    customerId: number,
  ): Promise<{ userId: number; tokens: string[] }[]> {
    const rawQuery = `
        SELECT u.id AS userId, GROUP_CONCAT(udt.device_token SEPARATOR ',') as tokens
            FROM riders r
            INNER JOIN users u ON r.user_id = u.id
            LEFT JOIN user_device_tokens udt ON udt.user_id = u.id
            WHERE r.id = ?
            GROUP BY u.id;
        `;

    const result = await this.entityManager.query(rawQuery, [customerId]);

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
      url: AppConstants.appServices.warehouseBaseUrl + '/orders/' + order?.id,
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

  async sendOrderCancellationNotification(
    updatedOrder: any,
    updatedDelivery: any,
    deliveryRequest: any,
  ): Promise<any> {
    // console.log('From notification - updatedOrder', updatedOrder);
    // console.log('From notification - updatedDelivery', updatedDelivery);
    // console.log('From notification - deliveryRequest', deliveryRequest);
    if (
      updatedOrder?.order_type === OrderType.TRANSPORTATION_ONLY &&
      deliveryRequest?.assignedRider?.id
    ) {
      const title = 'Delivery request cancelled';
      const message =
        'The delivery request has been cancelled by ' +
        deliveryRequest?.requestFrom?.name;

      const requestedByUserId = deliveryRequest?.requestFrom?.id;
      const requestedByUserName = deliveryRequest?.requestFrom?.name;
      const requestId = deliveryRequest?.id;
      const riderId = deliveryRequest?.assignedRider?.id;

      const data = {
        target: 'rider',
        type: 'delivery_request_cancel',
        requestId: requestId,
        requestedByUserId: requestedByUserId.toString(),
        requestedByUserName: requestedByUserName,
        riderId: riderId.toString(),
      };

      const userDeviceTokens = await this.getUserDeviceTokensByRiderId(riderId);

      for (const rider of userDeviceTokens) {
        await this.notificationService.sendAndStoreNotification(
          rider.userId,
          rider.tokens,
          title,
          message,
          { ...data },
        );
      }

      console.log('customerId', riderId);
      console.log('userDeviceTokens', userDeviceTokens);
      return {
        riderId,
        userDeviceTokens,
      };
    }

    // else if (
    //   updatedOrder?.order_type === OrderType.PRODUCT_AND_TRANSPORT &&
    //   updatedOrder?.order_status === OrderStatus.PENDING
    // ) {
    //   const title = 'Order cancelled';
    //   const message = 'The order has been cancelled by the customer.';

    //   const data = {
    //     type: 'delivery-request',
    //     orderId: deliveryRequest?.orderId.toString(),
    //     deliveryId: deliveryRequest?.deliveryId.toString(),
    //     deliveryUserId: deliveryRequest?.assignedRider?.id.toString(),
    //     deliveryUserName: deliveryRequest?.assignedRider?.name,
    //   };

    //   warehouseId = deliveryRequest?.pickupLocation?.warehouse_id;
    //   data['target'] = 'warehouse';
    //   data['warehouseId'] = warehouseId.toString();
    //   data['url'] =
    //     AppConstants.appServices.warehouseBaseUrl +
    //     '/deliveries/' +
    //     deliveryRequest?.deliveryId;

    //   const warehouseDeviceTokens = await this.getUserDeviceTokensByWarehouseId(
    //     warehouseId,
    //   );

    //   for (const warehouse of warehouseDeviceTokens) {
    //     console.log('warehouse', warehouse);
    //     await this.notificationService.sendAndStoreNotification(
    //       warehouse.userId,
    //       warehouse.tokens,
    //       title,
    //       message,
    //       { ...data },
    //     );
    //   }

    //   customerId = deliveryRequest?.dropOffLocation?.customer_id;
    //   data['target'] = 'customer';
    //   data['customerId'] = customerId.toString();

    //   const customerDeviceTokens = await this.getUserDeviceTokensByRiderId(
    //     customerId,
    //   );

    //   for (const customer of customerDeviceTokens) {
    //     await this.notificationService.sendAndStoreNotification(
    //       customer.userId,
    //       customer.tokens,
    //       title,
    //       message,
    //       { ...data },
    //     );
    //   }

    //   userDeviceTokens = customerDeviceTokens.concat(warehouseDeviceTokens);
    // }
    else {
      console.log(
        'Order type not implemented for the notification, order type:',
        updatedOrder?.order_type,
      );
    }
  }
}

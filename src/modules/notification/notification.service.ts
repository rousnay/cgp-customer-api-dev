import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notification } from './notification.schema';
import { DeliveryRequestNotification } from './delivery-request-notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<Notification>,
    @InjectModel('DeliveryRequestNotification')
    private deliveryRequestNotificationModel: Model<DeliveryRequestNotification>,
  ) {}

  async createNotification(
    userId: number,
    deviceTokens: string[],
    title: string,
    message: string,
    data?: object,
  ): Promise<Notification> {
    const newNotification = new this.notificationModel({
      userId,
      deviceTokens,
      title,
      message,
      data,
    });
    return await newNotification.save();
  }

  async createDeliveryRequestNotification(
    messageId: string,
    requestedByUserId: number,
    riderId: number,
    requestId: number,
    deviceToken: string,
  ): Promise<DeliveryRequestNotification> {
    const newDeliveryRequestNotification =
      new this.deliveryRequestNotificationModel({
        messageId,
        requestedByUserId,
        riderId,
        requestId,
        deviceToken,
      });
    return await newDeliveryRequestNotification.save();
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndUpdate(notificationId, {
      isRead: true,
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}

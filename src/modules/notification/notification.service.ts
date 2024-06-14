import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FirebaseAdminService } from '@services/firebase-admin.service';

import {
  Notification,
  DeliveryRequestNotification,
  NotificationModel,
  DeliveryRequestNotificationModel,
} from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly firebaseAdminService: FirebaseAdminService,
    @InjectModel(NotificationModel.modelName)
    private notificationModel: Model<Notification>,
    @InjectModel(DeliveryRequestNotificationModel.modelName)
    private deliveryRequestNotificationModel: Model<DeliveryRequestNotification>,
  ) {}

  async sendAndStoreNotification(
    userId: number,
    deviceTokens: string[],
    title: string,
    message: string,
    data: { [key: string]: string },
  ) {
    const notification = await this.createNotification(
      userId,
      deviceTokens,
      title,
      message,
      data,
    );
    const notificationId = notification._id.toString();

    const fcmData = {
      id: notificationId,
      ...data,
    };

    console.log('FCM Data:', fcmData);

    const fcmMessageId = await this.firebaseAdminService.sendNotification(
      deviceTokens,
      title,
      message,
      fcmData,
    );

    console.log(
      'FCM Response:',
      fcmMessageId,
      'Notification ID:',
      notificationId,
    );

    return { fcmMessageId, notificationId };
  }

  async createNotification(
    userId: number,
    deviceTokens: string[],
    title: string,
    message: string,
    data?: { [key: string]: string },
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

  async markAsRead(notificationId: string): Promise<void> {
    // Try to update the notification in the Notification collection
    const notification = await this.notificationModel
      .findById(notificationId)
      .exec();
    if (notification) {
      await this.notificationModel
        .findByIdAndUpdate(notificationId, { isRead: true })
        .exec();
      return;
    }

    // Try to update the notification in the DeliveryRequestNotification collection
    const deliveryRequestNotification =
      await this.deliveryRequestNotificationModel
        .findById(notificationId)
        .exec();
    if (deliveryRequestNotification) {
      await this.deliveryRequestNotificationModel
        .findByIdAndUpdate(notificationId, { isRead: true })
        .exec();
      return;
    }

    // If no notification is found in any collection, throw an error
    throw new NotFoundException(
      `Notification with ID ${notificationId} not found`,
    );
  }

  async getUserNotifications(): Promise<any[]> {
    const userId = this.request['user'].user_id;
    console.log('userId', userId);
    // Combine the notifications from different collections
    const notificationsFromCollection1 = this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    const notificationsFromCollection2 = this.deliveryRequestNotificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    const allNotifications = await Promise.all([
      notificationsFromCollection1,
      notificationsFromCollection2 /* Add more collections here */,
    ]);

    // Flatten the array of arrays
    const flattenedNotifications = allNotifications.flat();

    // Sort the combined notifications by createdAt in descending order
    return flattenedNotifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async sendAndStoreDeliveryRequestNotification(
    userId: number,
    deviceToken: string,
    title: string,
    message: string,
    data: { [key: string]: string },
  ) {
    const notification = await this.createDeliveryRequestNotification(
      userId,
      deviceToken,
      data,
    );
    const notificationId = notification._id.toString();

    const fcmData = {
      id: notificationId,
      ...data,
    };

    console.log('FCM Data:', fcmData);

    const fcmMessageId =
      await this.firebaseAdminService.sendDeliveryRequestNotification(
        deviceToken,
        title,
        message,
        fcmData,
      );

    console.log(
      'FCM Response:',
      fcmMessageId,
      'Notification ID:',
      notificationId,
    );

    return { fcmMessageId, notificationId };
  }

  async createDeliveryRequestNotification(
    userId: number,
    deviceToken: string,
    data: { [key: string]: string },
  ): Promise<DeliveryRequestNotification> {
    const newDeliveryRequestNotification =
      new this.deliveryRequestNotificationModel({
        userId,
        deviceToken,
        data,
      });

    return await newDeliveryRequestNotification.save();
  }
}

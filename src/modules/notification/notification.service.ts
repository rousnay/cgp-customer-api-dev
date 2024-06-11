import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notification } from './notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<Notification>,
  ) {}

  async createNotification(
    userId: number,
    device_tokens: string[],
    title: string,
    message: string,
    data?: object,
  ): Promise<Notification> {
    const newNotification = new this.notificationModel({
      userId,
      device_tokens,
      title,
      message,
      data,
    });
    return await newNotification.save();
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

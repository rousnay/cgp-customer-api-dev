import { Schema, Document } from 'mongoose';

export const DeliveryRequestNotificationSchema = new Schema({
  messageId: { type: String, required: true },
  deviceToken: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  data: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export interface DeliveryRequestNotification extends Document {
  id: string;
  messageId: string;
  deviceToken: string;
  isRead: boolean;
  data: { [key: string]: string };
  createdAt: Date;
}

import { Schema, Document } from 'mongoose';

export const DeliveryRequestNotificationSchema = new Schema({
  messageId: { type: String, required: true },
  requestedByUserId: { type: Number, required: true },
  riderId: { type: Number, required: true },
  requestId: { type: Number, required: true },
  deviceToken: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export interface DeliveryRequestNotification extends Document {
  id: string;
  messageId: string;
  requestedByUserId: string;
  riderId: number;
  requestId: number;
  deviceToken: string;
  isRead: boolean;
  createdAt: Date;
}

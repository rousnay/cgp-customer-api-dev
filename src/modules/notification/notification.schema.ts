import { Schema, Document } from 'mongoose';

export const NotificationSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export interface Notification extends Document {
  id: string;
  userId: string;
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: Date;
}

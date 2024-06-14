import { Schema, Document, model } from 'mongoose';

// export const NotificationSchema = new Schema({
//   userId: { type: Number, required: true },
//   deviceTokens: { type: [String], required: true },
//   title: { type: String, required: true },
//   message: { type: String, required: true },
//   data: { type: Object, default: {} },
//   isRead: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

// export interface Notification extends Document {
//   id: string;
//   userId: number;
//   deviceTokens: string[];
//   title: string;
//   message: string;
//   data: { [key: string]: string };
//   isRead: boolean;
//   createdAt: Date;
// }

// Base schema and interface for shared properties
const BaseNotificationSchema = new Schema({
  userId: { type: Number, required: true },
  data: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export interface BaseNotification extends Document {
  id: string;
  userId: number;
  data: { [key: string]: string };
  isRead: boolean;
  createdAt: Date;
}

// Notification schema and interface
export const NotificationSchema = new Schema({
  deviceTokens: { type: [String], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
});
NotificationSchema.add(BaseNotificationSchema);

export interface Notification extends BaseNotification {
  deviceTokens: string[];
  title: string;
  message: string;
}

// DeliveryRequestNotification schema and interface
export const DeliveryRequestNotificationSchema = new Schema({
  deviceToken: { type: String, required: true },
});
DeliveryRequestNotificationSchema.add(BaseNotificationSchema);

export interface DeliveryRequestNotification extends BaseNotification {
  deviceToken: string;
}

// Models
export const NotificationModel = model<Notification>(
  'Notification',
  NotificationSchema,
);
export const DeliveryRequestNotificationModel =
  model<DeliveryRequestNotification>(
    'DeliveryRequestNotification',
    DeliveryRequestNotificationSchema,
  );

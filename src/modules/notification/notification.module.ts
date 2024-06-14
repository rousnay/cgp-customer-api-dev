import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@config/config.module';
import { FirebaseAdminService } from '@services/firebase-admin.service';
import {
  DeliveryRequestNotificationSchema,
  NotificationSchema,
} from './schemas/notification.schema';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { FirebaseAdminModule } from '@services/firebase-admin.module';

@Module({
  imports: [
    ConfigModule,
    FirebaseAdminModule,
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
      {
        name: 'DeliveryRequestNotification',
        schema: DeliveryRequestNotificationSchema,
      },
    ]),
  ],
  providers: [NotificationService],
  controllers: [NotificationsController],
  exports: [NotificationService],
})
export class NotificationsModule {}

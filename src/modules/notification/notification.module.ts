import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@config/config.module';
import { FirebaseAdminService } from '@services/firebase-admin.service';
import { NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { DeliveryRequestNotificationSchema } from './delivery-request-notification.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
      {
        name: 'DeliveryRequestNotification',
        schema: DeliveryRequestNotificationSchema,
      },
    ]),
  ],
  providers: [NotificationService, FirebaseAdminService],
  controllers: [NotificationsController],
  exports: [NotificationService],
})
export class NotificationsModule {}

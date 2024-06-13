import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@config/config.module';
import { FirebaseAdminService } from '@services/firebase-admin.service';
import { NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { DeliveryRequestNotificationSchema } from './delivery-request-notification.schema';
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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@config/config.module';
import { FirebaseAdminService } from '@services/firebase-admin.service';
import { NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notification.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationService, FirebaseAdminService],
  controllers: [NotificationsController],
  exports: [NotificationService],
})
export class NotificationsModule {}

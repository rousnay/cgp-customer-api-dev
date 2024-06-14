import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirebaseAdminService } from '@services/firebase-admin.service';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { SendDeliveryRequestNotificationDto } from './dtos/send-delivery-request-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a notification to targeted devices' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent and stored successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    const payload = {
      notification: {
        title: sendNotificationDto.title,
        body: sendNotificationDto.message,
      },
      // data: JSON.stringify(sendNotificationDto.data)
      data: { ...sendNotificationDto.data },
    };

    // Send the notification to multiple devices
    const response = await this.firebaseAdminService.sendNotification(
      sendNotificationDto.deviceTokens,
      payload,
    );

    // Log or handle the response if needed
    console.log('FCM Response:', response);

    // Store the notification
    await this.notificationService.createNotification(
      sendNotificationDto.userId,
      sendNotificationDto.deviceTokens,
      sendNotificationDto.title,
      sendNotificationDto.message,
      sendNotificationDto.data,
    );

    return { message: 'Notifications sent and stored', response };
  }

  @Post('delivery-request')
  @ApiOperation({
    summary:
      'Send a delivery request notification to all active riders nearby the pickup point',
  })
  @ApiResponse({
    status: 201,
    description: 'Delivery request notifications sent and stored successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async sendDeliveryRequestToAllRiders(
    @Body()
    sendDeliveryRequestNotificationDto: SendDeliveryRequestNotificationDto,
  ) {
    const result =
      await this.notificationService.sendAndStoreDeliveryRequestNotification(
        sendDeliveryRequestNotificationDto.deviceToken,
        sendDeliveryRequestNotificationDto.title,
        sendDeliveryRequestNotificationDto.message,
        sendDeliveryRequestNotificationDto.data,
      );

    return {
      message: 'Delivery request notifications sent and stored',
      fcmMessageId: result.fcmMessageId,
    };
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { FirebaseAdminService } from '@services/firebase-admin.service';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { SendDeliveryRequestNotificationDto } from './dtos/delivery-request-notification.dto';
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
      data: sendNotificationDto.data
        ? { customData: sendNotificationDto.data }
        : undefined,
    };

    // Send the notification to multiple devices
    const response = await this.firebaseAdminService.sendNotification(
      sendNotificationDto.tokens,
      payload,
    );

    // Log or handle the response if needed
    console.log('FCM Response:', response);

    // Store the notification
    await this.notificationService.createNotification(
      sendNotificationDto.userId,
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
    const payload = {
      notification: {
        title: sendDeliveryRequestNotificationDto.title,
        body: sendDeliveryRequestNotificationDto.message,
      },
      data: sendDeliveryRequestNotificationDto.data
        ? { customData: sendDeliveryRequestNotificationDto.data }
        : undefined,
    };

    // Send the notification to all riders
    const response = await this.firebaseAdminService.sendNotification(
      sendDeliveryRequestNotificationDto.tokens,
      payload,
    );

    // Log or handle the response if needed
    console.log('FCM Response:', response);

    // Store the notification
    await this.notificationService.createNotification(
      sendDeliveryRequestNotificationDto.userId,
      sendDeliveryRequestNotificationDto.title,
      sendDeliveryRequestNotificationDto.message,
      sendDeliveryRequestNotificationDto.data,
    );

    return {
      message: 'Delivery request notifications sent and stored',
      response,
    };
  }
}

import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  NotFoundException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { SendDeliveryRequestNotificationDto } from './dtos/send-delivery-request-notification.dto';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Send a notification to targeted devices' })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    const result = await this.notificationService.sendAndStoreNotification(
      sendNotificationDto.userId,
      sendNotificationDto.deviceTokens,
      sendNotificationDto.title,
      sendNotificationDto.message,
      sendNotificationDto.data,
    );

    return {
      status: 'success',
      message: 'Delivery request notifications sent and stored',
      data: {
        fcmMessageId: result.fcmMessageId,
        notificationId: result.notificationId,
      },
    };
  }

  @Post('delivery-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary:
      'Send a delivery request notification to all active riders nearby the pickup point',
  })
  async sendDeliveryRequestToAllRiders(
    @Body()
    sendDeliveryRequestNotificationDto: SendDeliveryRequestNotificationDto,
  ) {
    const result =
      await this.notificationService.sendAndStoreDeliveryRequestNotification(
        sendDeliveryRequestNotificationDto.userId,
        sendDeliveryRequestNotificationDto.deviceToken,
        sendDeliveryRequestNotificationDto.title,
        sendDeliveryRequestNotificationDto.message,
        sendDeliveryRequestNotificationDto.data,
      );

    return {
      status: 'success',
      message: 'Delivery request notifications sent and stored',
      data: {
        fcmMessageId: result.fcmMessageId,
        notificationId: result.notificationId,
      },
    };
  }

  @Put('mark-as-read/:notificationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    try {
      await this.notificationService.markAsRead(notificationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Notification with ID ${notificationId} not found`,
        );
      }
      throw error;
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get notifications for logged-in the user' })
  async getUserNotifications(): Promise<any[]> {
    return this.notificationService.getUserNotifications();
  }
}

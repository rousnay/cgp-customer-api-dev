import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({
    description: 'User ID to send the notification to',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Device tokens to send the notification to',
    example: ['device_token1', 'device_token2'],
    type: [String],
  })
  deviceTokens: string[];

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Personal Notification',
  })
  title: string;

  @ApiProperty({
    description: 'Message body of the notification',
    example: 'Your order has been accepted by warehouse!',
  })
  message: string;

  @ApiProperty({
    description: 'Additional data as a JSON object for the notification',
    example:
      '{"id": "1", "target": "customer", "customerId": "123", "type": "order", "orderId": "123", "warehouseId": "1", "warehouseName": "John Doe"}',
    required: false,
  })
  data?: { [key: string]: string };
}

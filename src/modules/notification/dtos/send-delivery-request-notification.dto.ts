import { ApiProperty } from '@nestjs/swagger';

export class SendDeliveryRequestNotificationDto {
  @ApiProperty({
    description: 'User ID to send the notification to',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Device tokens to send the notification to',
    example:
      'fUhjNmN-QnOBG0u81Q_P0o:APA91bH5KPV1duuJGYweippvPj9qxqJsssMY6WeznZ3Xp90QDS70uBNk3C3rs3rbC5xT3MgXKkrYd_n9TWPzVLG-E_rhwGaxT6M-HmJO5fC1b-CXsA23g2jPDQSXrBYuSgfQWHK-94_J',
    type: String,
  })
  deviceToken: string;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'New Delivery Request',
  })
  title: string;

  @ApiProperty({
    description: 'Message body of the notification',
    example: 'You have a new delivery request from John Doe',
  })
  message: string;

  @ApiProperty({
    description: 'Additional data as a JSON object for the notification',
    example:
      '{"id": "1", "target": "rider", "riderId": "3", "type": "delivery_request", "requestId": "123", "requestedByUserId": "1", "requestedByUserName": "John Doe"}',
    required: false,
  })
  data: { [key: string]: string };
}

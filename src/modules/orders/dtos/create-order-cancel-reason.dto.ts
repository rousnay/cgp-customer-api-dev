import { IsEnum, IsString, IsBoolean } from 'class-validator';
import { OrderCancelReasonType } from '@common/enums/order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderCancelReasonDto {
  @IsEnum(OrderCancelReasonType)
  @ApiProperty({ description: 'Reason type', enum: OrderCancelReasonType })
  reason_type: OrderCancelReasonType;

  @IsString()
  @ApiProperty({ type: String, description: 'The Reason' })
  reason: string;

  @IsBoolean()
  @ApiProperty({ type: Boolean, description: 'Is active' })
  is_active: boolean;
}

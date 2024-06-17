import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { AssignedRider } from '../schemas/delivery-request.schema';
import { ShippingStatus } from '@common/enums/delivery.enum';

export class UpdateDeliveryRequestDto {
  @ApiProperty({ enum: ShippingStatus, required: false })
  @IsEnum(ShippingStatus)
  @IsOptional()
  status?: ShippingStatus;

  @ApiProperty({ type: AssignedRider, required: false })
  @IsOptional()
  @IsObject()
  assignedRider?: AssignedRider;
}

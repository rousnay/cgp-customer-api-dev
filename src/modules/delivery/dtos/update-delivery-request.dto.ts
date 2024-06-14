import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { AssignedRider } from '../schemas/delivery-request.schema';
import { DeliveryStatus } from '@common/enums/delivery.enum';

export class UpdateDeliveryRequestDto {
  @ApiProperty({ enum: DeliveryStatus, required: false })
  @IsEnum(DeliveryStatus)
  @IsOptional()
  status?: DeliveryStatus;

  @ApiProperty({ type: AssignedRider, required: false })
  @IsOptional()
  @IsObject()
  assignedRider?: AssignedRider;
}

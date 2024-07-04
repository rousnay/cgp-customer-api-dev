import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator';
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

  @IsOptional()
  @IsDateString()
  acceptedAt?: Date;

  @IsOptional()
  @IsDateString()
  cancelledAt?: Date;

  @IsOptional()
  @IsDateString()
  updatedAt?: Date;
}

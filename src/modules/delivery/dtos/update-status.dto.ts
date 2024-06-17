import { ShippingStatus } from '@common/enums/delivery.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ShippingStatus })
  @IsEnum(ShippingStatus)
  status: ShippingStatus;
}

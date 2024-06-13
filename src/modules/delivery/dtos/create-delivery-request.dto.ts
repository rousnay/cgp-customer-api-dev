import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { CreateUserAddressDto } from '@modules/user-address-book/create-user-address.dto';
import { OrderType } from '@common/enums/order.enum';

class RequestFrom {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;
}

enum DeliveryStatus {
  Searching = 'searching',
  Accepted = 'accepted',
  Expired = 'expired',
}

class AssignedRider {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;
}

export class CreateDeliveryRequestDto {
  @ApiProperty({ type: RequestFrom })
  @IsObject()
  @IsNotEmpty()
  requestFrom: RequestFrom;

  @ApiProperty({ type: CreateUserAddressDto })
  @IsObject()
  pickupLocation: CreateUserAddressDto;

  @ApiProperty({ type: CreateUserAddressDto })
  @IsObject()
  dropOffLocation: CreateUserAddressDto;

  @ApiProperty()
  @IsString()
  totalDistance: string;

  @ApiProperty()
  @IsString()
  totalWeight: string;

  @ApiProperty()
  @IsNumber()
  deliveryCost: number;

  @ApiProperty()
  @IsString()
  estimatedArrivalTime: string;

  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  stripeId: string;

  @ApiProperty()
  @IsString()
  deliveryId: string;

  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({ enum: DeliveryStatus })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty({ type: AssignedRider, required: false })
  @IsOptional()
  @IsObject()
  assignedRider?: AssignedRider;
}

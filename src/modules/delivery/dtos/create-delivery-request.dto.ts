import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { CreateUserAddressDto } from '@modules/user-address-book/create-user-address.dto';
import { OrderType } from '@common/enums/order.enum';
import { ShippingStatus } from '@common/enums/delivery.enum';

class AvgRating {
  @ApiProperty()
  @IsNumber()
  average_rating: number;

  @ApiProperty()
  @IsNumber()
  total_ratings: number;
}

class RequestFrom {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ type: AvgRating })
  @IsObject()
  avg_rating: AvgRating;
}

class AssignedRider {
  @ApiProperty()
  @IsNumber()
  id: number;

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
  deliveryCost: string;

  @ApiProperty()
  @IsString()
  riderFee: string;

  @ApiProperty()
  @IsString()
  estimatedArrivalTime: string;

  @ApiProperty()
  @IsString()
  orderId: number;

  @ApiProperty()
  @IsString()
  stripeId: string;

  @ApiProperty()
  @IsNumber()
  deliveryId: number;

  @ApiProperty()
  @IsNumber()
  targetedVehicleTypeId: number;

  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({ enum: ShippingStatus })
  @IsEnum(ShippingStatus)
  status: ShippingStatus;

  @ApiProperty({ type: AssignedRider, required: false })
  @IsOptional()
  @IsObject()
  assignedRider?: AssignedRider;

  @IsOptional()
  @IsDateString()
  createdAt?: Date;
}

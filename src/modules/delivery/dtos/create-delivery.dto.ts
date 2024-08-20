import { IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ShippingStatus } from '@common/enums/delivery.enum';

export class CreateDeliveryDto {
  @IsEnum(ShippingStatus)
  shipping_status: ShippingStatus;

  @IsOptional()
  @IsNumber()
  rider_id?: number;

  @IsOptional()
  @IsNumber()
  customer_id?: number;

  @IsOptional()
  @IsNumber()
  warehouse_id?: number;

  @IsOptional()
  @IsNumber()
  order_id?: number;

  @IsOptional()
  @IsNumber()
  vehicle_id?: number;

  @IsOptional()
  @IsNumber()
  vehicle_type_id?: number;

  @IsOptional()
  @IsNumber()
  init_distance?: number;

  @IsOptional()
  @IsNumber()
  final_distance?: number;

  @IsOptional()
  @IsNumber()
  init_duration?: number;

  @IsOptional()
  @IsNumber()
  final_duration?: number;

  @IsOptional()
  @IsNumber()
  rider_fee?: number;

  @IsOptional()
  @IsNumber()
  delivery_charge?: number;

  @IsOptional()
  @IsDateString()
  accepted_at?: Date;

  @IsOptional()
  @IsDateString()
  picked_up_at?: Date;

  @IsOptional()
  @IsDateString()
  delivered_at?: Date;

  @IsOptional()
  @IsDateString()
  cancelled_at?: Date;
}

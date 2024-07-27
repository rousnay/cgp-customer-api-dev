import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CreateUserAddressDto } from '@modules/user-address-book/create-user-address.dto';
import { OrderType } from '@common/enums/order.enum';
import { ShippingStatus } from '@common/enums/delivery.enum';

export class AvgRating {
  @Prop({ required: true })
  average_rating: number;

  @Prop({ required: true })
  total_ratings: number;
}

export class RequestFrom {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: AvgRating, required: true })
  avg_rating: AvgRating;
}

export class AssignedRider {
  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  vehicleId: number;
}

@Schema()
export class DeliveryRequest extends Document {
  @Prop({ type: RequestFrom, required: true })
  requestFrom: RequestFrom;

  @Prop({ type: Object, required: true })
  pickupLocation: CreateUserAddressDto;

  @Prop({ type: Object, required: true })
  dropOffLocation: CreateUserAddressDto;

  @Prop({ required: true })
  totalDistance: string;

  @Prop({ required: true })
  totalWeight: string;

  @Prop({ required: true })
  deliveryCost: string;

  @Prop({ required: true })
  riderFee: string;

  @Prop({ required: true })
  estimatedArrivalTime: string;

  @Prop({ required: true })
  orderId: number;

  @Prop({ required: true })
  stripeId: string;

  @Prop({ required: true })
  deliveryId: number;

  @Prop({ required: true })
  targetedVehicleTypeId: number;

  @Prop({
    enum: OrderType,
    required: true,
    default: null,
  })
  orderType: OrderType;

  @Prop({
    enum: ShippingStatus,
    required: true,
    default: ShippingStatus.SEARCHING,
  })
  status: ShippingStatus;

  @Prop({ type: AssignedRider, default: null })
  assignedRider?: AssignedRider;

  @Prop({ default: null })
  createdAt?: Date;

  @Prop({ default: null })
  acceptedAt?: number;

  @Prop({ default: null })
  cancelledAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const DeliveryRequestSchema =
  SchemaFactory.createForClass(DeliveryRequest);

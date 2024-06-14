import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CreateUserAddressDto } from '@modules/user-address-book/create-user-address.dto';
import { OrderType } from '@common/enums/order.enum';
import { DeliveryStatus } from '@common/enums/delivery.enum';

export class RequestFrom {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;
}

export class AssignedRider {
  @Prop()
  id: number;

  @Prop()
  name: string;
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
  deliveryCost: number;

  @Prop({ required: true })
  estimatedArrivalTime: string;

  @Prop({ required: true })
  orderId: number;

  @Prop({ required: true })
  stripeId: string;

  @Prop({ required: true })
  deliveryId: number;

  @Prop({
    enum: OrderType,
    required: true,
    default: null,
  })
  orderType: OrderType;

  @Prop({
    enum: DeliveryStatus,
    required: true,
    default: DeliveryStatus.Searching,
  })
  status: DeliveryStatus;

  @Prop({ type: AssignedRider, default: null })
  assignedRider?: AssignedRider;
}

export const DeliveryRequestSchema =
  SchemaFactory.createForClass(DeliveryRequest);

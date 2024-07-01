import { PartialType } from '@nestjs/swagger';
import { CreateOrderCancelReasonDto } from './create-order-cancel-reason.dto';

export class UpdateOrderCancelReasonDto extends PartialType(
  CreateOrderCancelReasonDto,
) {}

import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryDto } from './dtos/create-delivery.dto';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {}

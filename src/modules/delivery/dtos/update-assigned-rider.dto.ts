import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { AssignedRider } from '../schemas/delivery-request.schema';

export class UpdateAssignedRiderDto {
  @ApiProperty({ type: AssignedRider })
  @IsObject()
  assignedRider: AssignedRider;
}

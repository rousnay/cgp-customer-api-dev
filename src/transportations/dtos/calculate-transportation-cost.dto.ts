import { ApiProperty } from '@nestjs/swagger';

// export class CoordinatesDto {
//   @ApiProperty()
//   latitude: string;

//   @ApiProperty()
//   longitude: string;
// }

export class CalculateTransportationCostDto {
  @ApiProperty({ required: false })
  pickup_coordinates?: string;

  @ApiProperty({ required: false })
  shipping_coordinates?: string;

  @ApiProperty({ required: false })
  vehicle_type_id: number;
}

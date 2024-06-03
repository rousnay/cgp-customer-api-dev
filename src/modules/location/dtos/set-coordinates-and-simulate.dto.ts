import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetCoordinatesAndSimulateDto {
  @ApiProperty({
    description: 'Minimum latitude for the coordinates (-90 to 0)',
    example: 23.665,
  })
  @IsNumber()
  minLatitude: number;

  @ApiProperty({
    description: 'Maximum latitude for the coordinates (0 to 90)',
    example: 23.934,
  })
  @IsNumber()
  maxLatitude: number;

  @ApiProperty({
    description: 'Minimum longitude for the coordinates (-180 to 0)',
    example: 90.279,
  })
  @IsNumber()
  minLongitude: number;

  @ApiProperty({
    description: 'Maximum longitude for the coordinates (0 to 180)',
    example: 90.509,
  })
  @IsNumber()
  maxLongitude: number;

  @ApiProperty({
    description: 'Number of riders to simulate',
    example: 10,
  })
  @IsNumber()
  riderCount: number;
}

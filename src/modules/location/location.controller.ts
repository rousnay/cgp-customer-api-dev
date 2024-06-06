import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Query,
  Post,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { LocationService } from './location.service';
import { Location } from './schemas/location.schema';
import { SetCoordinatesAndSimulateDto } from './dtos/set-coordinates-and-simulate.dto';
import {
  GetLocationOfRiderSwagger,
  GetNearbyRidersSwagger,
  SimulateLocationsSwagger,
  UpdateLocationOfRiderSwagger,
} from './decorators/swagger-decorators';

@ApiTags("Riders's Locations")
@Controller('rider-locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @GetNearbyRidersSwagger()
  @Get('nearby')
  async getNearbyRiders(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('radius', ParseIntPipe) radius: number,
  ): Promise<any> {
    console.log(
      'Controller: getNearbyRiders called with latitude:',
      latitude,
      'longitude:',
      longitude,
      'radius:',
      radius,
    );
    return this.locationService.getNearbyRiders(latitude, longitude, radius);
  }

  @GetLocationOfRiderSwagger()
  @Get(':riderId')
  async getLocation(@Param('riderId') riderId: number): Promise<Location> {
    return this.locationService.getLocation(riderId);
  }
}

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

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @GetLocationOfRiderSwagger()
  @Get('rider/:riderId')
  async getLocation(@Param('riderId') riderId: number): Promise<Location> {
    return this.locationService.getLocation(riderId);
  }

  @UpdateLocationOfRiderSwagger()
  @Put('rider/:riderId')
  async updateLocation(
    @Param('riderId') riderId: number,
    @Body() updateLocationDto: { latitude: number; longitude: number },
  ): Promise<Location> {
    const { latitude, longitude } = updateLocationDto;
    return this.locationService.updateLocation(riderId, latitude, longitude);
  }

  @GetNearbyRidersSwagger()
  @Get('nearby-riders')
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

  @SimulateLocationsSwagger()
  @Post('start-simulation')
  async startSimulation(
    @Body() coordinatesAndSimulateDto: SetCoordinatesAndSimulateDto,
  ) {
    const result = await this.locationService.startSimulation(
      coordinatesAndSimulateDto,
    );
    return result;
  }

  @Post('stop-simulation')
  @ApiOperation({
    summary: 'Stop currently running location simulation.',
  })
  stopSimulation() {
    return this.locationService.stopSimulation();
  }
}

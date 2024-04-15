import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GeoLocationService } from '../services/geolocation.service';

@Controller('geolocation')
@ApiTags('GeoLocation')
export class GeoLocationController {
  geolocationService: any;
  constructor(private readonly GeoLocationService: GeoLocationService) {}

  @Get('coordinatesByAddress')
  @ApiOperation({
    summary: 'Get Coordinates (latitude, longitude) by address',
  })
  async getCoordinates(@Query('address') address: string) {
    try {
      const coordinates =
        await this.GeoLocationService.getCoordinatesFromAddress(address);
      return coordinates;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('distanceByAddresses')
  @ApiOperation({
    summary: 'Get Distance and Duration between two addresses',
  })
  async getDistanceByAddresses(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    try {
      const response = await this.GeoLocationService.getDistanceByAddresses(
        origin,
        destination,
      );
      const distance = response.data.rows[0].elements[0].distance;
      const duration = response.data.rows[0].elements[0].duration;
      //   const origin_addresses = response.data.origin_addresses[0];
      //   const destination_addresses = response.data.destination_addresses[0];
      return { distance, duration };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('distanceByCoordinates')
  @ApiOperation({
    summary: 'Get Distance and Duration between two coordinates',
  })
  @ApiResponse({
    status: 200,
    description: 'Distance and duration retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getDistanceByCoordinates(
    @Query('originLat') originLat: number,
    @Query('originLng') originLng: number,
    @Query('destinationLat') destinationLat: number,
    @Query('destinationLng') destinationLng: number,
  ) {
    try {
      const response = await this.GeoLocationService.getDistanceByCoordinates(
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      );
      const distance = response.data.rows[0].elements[0].distance;
      const duration = response.data.rows[0].elements[0].duration;
      return { distance, duration };
    } catch (error) {
      return { error: error.message };
    }
  }
}

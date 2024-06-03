import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { SetCoordinatesAndSimulateDto } from '../dtos/set-coordinates-and-simulate.dto';

export function GetLocationOfRiderSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get location of a rider' }),
    ApiParam({
      name: 'riderId',
      description: 'ID of the rider',
      example: 999001,
    }),
    ApiResponse({
      status: 200,
      description: 'The rider location has been successfully retrieved.',
    }),
  );
}

export function UpdateLocationOfRiderSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update location of a rider' }),
    ApiParam({
      name: 'riderId',
      description: 'ID of the rider',
      example: 999001,
    }),
    ApiBody({
      description: 'Location update data',
      schema: { example: { latitude: 23.722, longitude: 90.4515 } },
    }),
    ApiResponse({
      status: 200,
      description: 'The rider location has been successfully updated.',
    }),
  );
}
export function GetNearbyRidersSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get nearby riders' }),
    ApiQuery({
      name: 'latitude',
      type: Number,
      description: 'Latitude of the location',
      example: 23.7995,
    }),
    ApiQuery({
      name: 'longitude',
      type: Number,
      description: 'Longitude of the location',
      example: 90.394,
    }),
    ApiQuery({
      name: 'radius',
      type: Number,
      description: 'Radius to search for nearby riders',
      example: 15,
    }),
    ApiResponse({
      status: 200,
      description: 'List of nearby riders.',
    }),
  );
}

export function SimulateLocationsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Start location simulation' }),
    ApiBody({
      description: 'Coordinates and simulation settings',
      type: SetCoordinatesAndSimulateDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Simulation started successfully.',
    }),
  );
}

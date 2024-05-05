import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { TransportationVehicleDto } from '../dtos/transportation-vehicle.dto';

// Define a class representing your transportation vehicles service
@Injectable()
export class TransportationVehiclesService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<TransportationVehicleDto[]> {
    try {
      const query = await this.entityManager
        .createQueryBuilder()
        .select([
          'id',
          'type_id',
          'vehicle_capacity',
          'min_km',
          'min_fare',
          'per_km_fare',
          'max_time_in_minutes',
          'per_minutes_fare',
          'cf_media_id',
          'active',
        ])
        .from('vehicle_types', 'vt')
        .getRawMany();

      // Check if no data found
      if (query.length === 0) {
        throw new NotFoundException('No transportation vehicles found.');
      }

      return query; //to response with full results

      // Map raw results to DTO to return specific fields
      // const transportationVehicles: TransportationVehicleDto[] = query.map(
      //   (row) => ({
      //     id: row.id,
      //     type_id: row.type_id,
      //     vehicle_capacity: row.vehicle_capacity,
      //     min_km: row.min_km,
      //     min_fare: row.min_fare,
      //     per_km_fare: row.per_km_fare,
      //     max_time_in_minutes: row._max_time_in_minutes,
      //     per_minutes_fare: row.per_minutes_fare,
      //     cf_media_id: row.cf_media_id,
      //     active: row.active,
      //   }),
      // );

      // return transportationVehicles;
    } catch (error) {
      // Log the error and rethrow it for the calling code to handle
      console.error('Error fetching transportation vehicles:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<TransportationVehicleDto> {
    try {
      const query = await this.entityManager
        .createQueryBuilder()
        .select([
          'id',
          'type_id',
          'vehicle_capacity',
          'min_km',
          'min_fare',
          'per_km_fare',
          'max_time_in_minutes',
          'per_minutes_fare',
          'cf_media_id',
          'active',
        ])
        .from('vehicle_types', 'vt')
        .where('vt.id = :id', { id })
        .getRawOne();

      if (!query) {
        throw new NotFoundException('Vehicle not found');
      }

      return query;
    } catch (error) {
      // Log the error and rethrow it for the calling code to handle
      console.error(
        'Error fetching transportation vehicle with id ' + id + ':',
        error,
      );
      throw error;
    }
  }
}

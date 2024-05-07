import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { TransportationVehicleDto } from '../dtos/transportation-vehicle.dto';

// Define a class representing your transportation vehicles service
@Injectable()
export class TransportationVehiclesService {
  private readonly base_url = 'https://imagedelivery.net';
  private readonly account_hash = 'GoCn5FC83XAthwamRI9Rdg';
  private readonly variant = 'public';
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<TransportationVehicleDto[]> {
    try {
      const query = await this.entityManager
        .createQueryBuilder()
        .select(['vt.*', 's.name', 's.code', 'm.cloudflare_id', 'm.file'])
        .from('vehicle_types', 'vt')
        .leftJoin('statuses', 's', 'vt.type_id = s.id')
        .leftJoin('cf_media', 'm', 'vt.cf_media_id = m.id')
        .getRawMany();

      // Check if no data found
      if (query.length === 0) {
        throw new NotFoundException('No transportation vehicles found.');
      }

      // Map raw results to DTO to return specific fields
      const transportationVehicles: TransportationVehicleDto[] = query.map(
        (row) => ({
          id: row.id,
          type_id: row.type_id,
          name: row.name,
          code: row.code,
          media_url:
            this.base_url +
            '/' +
            this.account_hash +
            '/' +
            row.cloudflare_id +
            '/' +
            this.variant,
          vehicle_capacity: row.vehicle_capacity,
          min_km: row.min_km,
          min_fare: row.min_fare,
          per_km_fare: row.per_km_fare,
          max_time_in_minutes: row._max_time_in_minutes,
          per_minutes_fare: row.per_minutes_fare,
          active: row.active,
        }),
      );

      return transportationVehicles;
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
        .select(['vt.*', 's.name', 's.code', 'm.cloudflare_id', 'm.file'])
        .from('vehicle_types', 'vt')
        .leftJoin('statuses', 's', 'vt.type_id = s.id')
        .leftJoin('cf_media', 'm', 'vt.cf_media_id = m.id')
        .where('vt.type_id = :id', { id })
        .getRawOne();

      if (!query) {
        throw new NotFoundException('Vehicle not found');
      }

      const media_url =
        this.base_url +
        '/' +
        this.account_hash +
        '/' +
        query.cloudflare_id +
        '/' +
        this.variant;

      const transportationVehicle: TransportationVehicleDto = {
        id: query.id,
        type_id: query.type_id,
        name: query.name,
        code: query.code,
        media_url: media_url,
        vehicle_capacity: query.vehicle_capacity,
        min_km: query.min_km,
        min_fare: query.min_fare,
        per_km_fare: query.per_km_fare,
        max_time_in_minutes: query._max_time_in_minutes,
        per_minutes_fare: query.per_minutes_fare,
        active: query.active,
      };

      return transportationVehicle;

      // return query;
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

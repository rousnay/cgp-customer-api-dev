import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Location } from './schemas/location.schema';
import { SetCoordinatesAndSimulateDto } from './dtos/set-coordinates-and-simulate.dto';

@Injectable()
export class LocationService {
  private minLatitude: number;
  private maxLatitude: number;
  private minLongitude: number;
  private maxLongitude: number;
  private readonly interval = 1000; // 1 seconds in milliseconds
  private intervalRef: NodeJS.Timeout;

  constructor(
    @InjectModel('Location') private locationModel: Model<Location>,
  ) {}

  async getNearbyRiders(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<Location[]> {
    console.log(
      'Service: getNearbyRiders called with latitude:',
      latitude,
      'longitude:',
      longitude,
      'radius:',
      radius,
    );

    try {
      const results = await this.locationModel
        .find({
          location: {
            $geoWithin: {
              $centerSphere: [[longitude, latitude], radius / 6371], // radius converted to radians
            },
          },
          isActive: true,
        })
        .exec();

      console.log(
        'Service: Query successful, found locations:',
        results.length,
      );
      return results;
    } catch (error) {
      console.error('Service: Error in getNearbyRiders:', error);
      throw error;
    }
  }

  async getLocation(riderId: number): Promise<Location> {
    return this.locationModel
      .findOne({ riderId })
      .sort({ updatedAt: -1 })
      .exec();
  }
}

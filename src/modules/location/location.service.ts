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

  private getRandomCoordinate(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private async generateAndSaveRandomLocation(riderId: number) {
    const latitude = this.getRandomCoordinate(
      this.minLatitude,
      this.maxLatitude,
    );
    const longitude = this.getRandomCoordinate(
      this.minLongitude,
      this.maxLongitude,
    );
    const timestamp = new Date();

    try {
      // Update the existing entry or create a new one if it doesn't exist
      await this.locationModel.findOneAndUpdate(
        { riderId },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            updatedAt: timestamp,
          },
        },
        { upsert: true, new: true },
      );
      return { riderId, latitude, longitude, timestamp };
    } catch (error) {
      console.error(`Failed to update location for rider ${riderId}:`, error);
      return null;
    }
  }

  async startSimulation(dto: SetCoordinatesAndSimulateDto): Promise<any[]> {
    this.minLatitude = dto.minLatitude;
    this.maxLatitude = dto.maxLatitude;
    this.minLongitude = dto.minLongitude;
    this.maxLongitude = dto.maxLongitude;

    const messages: any[] = [];
    let currentRider = 0;

    const simulationPromise = new Promise<void>((resolve) => {
      this.intervalRef = setInterval(async () => {
        if (currentRider >= dto.riderCount) {
          this.stopSimulation();
          resolve();
          return;
        }
        const riderId = '999' + String(currentRider + 1).padStart(3, '0'); // Pads the number with leading zeros
        const data = await this.generateAndSaveRandomLocation(Number(riderId)); // Convert riderId to number (riderId);
        if (data) {
          messages.push(data);
          currentRider++;
        }
      }, this.interval);
    });

    await simulationPromise;
    return messages;
  }

  stopSimulation(): string {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
      return 'Simulation stopped successfully.';
    } else {
      return 'No active simulation to stop.';
    }
  }

  async saveLocation(
    riderId: string,
    latitude: number,
    longitude: number,
  ): Promise<Location> {
    const location = new this.locationModel({
      riderId: Number(riderId),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      updatedAt: new Date(),
    });
    return location.save();
  }

  async updateLocation(
    riderId: number,
    latitude: number,
    longitude: number,
  ): Promise<Location> {
    return this.locationModel
      .findOneAndUpdate(
        { riderId },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            updatedAt: new Date(),
          },
        },
        { new: true, upsert: true },
      )
      .exec();
  }

  async getLocation(riderId: number): Promise<Location> {
    return this.locationModel
      .findOne({ riderId })
      .sort({ updatedAt: -1 })
      .exec();
  }

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
}

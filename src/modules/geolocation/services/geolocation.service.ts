// geo.service.ts
import { Injectable } from '@nestjs/common';
import {
  Client,
  LatLngLiteral,
  GeocodeResponse,
  Status,
  DistanceMatrixResponse,
} from '@googlemaps/google-maps-services-js';

@Injectable()
export class GeoLocationService {
  private readonly googleMapsClient: Client;

  constructor() {
    this.googleMapsClient = new Client({});
  }

  async getCoordinatesFromAddress(address: string): Promise<LatLngLiteral> {
    try {
      const response: GeocodeResponse = await this.googleMapsClient.geocode({
        params: {
          address,
          // key: 'AIzaSyD8QJ0NhV8Sd6kGXRntcKyxT8akcoc72-c',
          key: 'AIzaSyCUqRnsyjWiluojL3z2-9VRoZ7ABubgbpE',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error('Address not found');
      }

      const location = response.data.results[0].geometry.location;
      return location;
    } catch (error) {
      throw new Error('Failed to fetch coordinates from address');
    }
  }

  async getDistance(
    origin: string,
    destination: string,
  ): Promise<DistanceMatrixResponse> {
    try {
      console.log(origin, destination);
      const response: DistanceMatrixResponse =
        await this.googleMapsClient.distancematrix({
          params: {
            origins: [origin],
            destinations: [destination],
            key: 'AIzaSyD8QJ0NhV8Sd6kGXRntcKyxT8akcoc72-c',
          },
        });

      if (response.status === 200) {
        return response;
      } else {
        throw new Error('Failed to retrieve distance');
      }
    } catch (error) {
      throw new Error('Error getting distance: ' + error.message);
    }
  }
}

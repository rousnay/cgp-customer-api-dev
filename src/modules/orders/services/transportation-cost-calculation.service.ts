import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Console } from 'console';

import {
  Client,
  LatLngLiteral,
  GeocodeResponse,
  Status,
  DistanceMatrixResponse,
} from '@googlemaps/google-maps-services-js';

import { Orders } from '../entities/orders.entity';
import { CalculateTransportationCostDto } from '../dtos/calculate-transportation-cost.dto';
import { TransportationVehiclesService } from '../services/transportation-vehicles.service';

@Injectable()
export class TransportationCostCalculationService {
  private readonly googleMapsClient: Client;
  constructor(
    @Inject(REQUEST) private readonly request: Request,

    @InjectRepository(Orders)
    private readonly transportationOrdersRepository: Repository<Orders>,
    private readonly transportationVehiclesService: TransportationVehiclesService,
  ) {
    this.googleMapsClient = new Client({});
  }

  async calculate(
    calculateTransportationCostDto: CalculateTransportationCostDto,
  ): Promise<any> {
    let distance;
    let duration;
    const gst = 0.1;
    const vehicle_type_id = calculateTransportationCostDto.vehicle_type_id;

    if (
      !calculateTransportationCostDto.pickup_coordinates ||
      !calculateTransportationCostDto.shipping_coordinates
    ) {
      throw new NotFoundException(
        'No location has been found with given coordinates',
      );
    }
    const response: DistanceMatrixResponse =
      await this.googleMapsClient.distancematrix({
        params: {
          origins: [calculateTransportationCostDto.pickup_coordinates],
          destinations: [calculateTransportationCostDto.shipping_coordinates],
          key: 'AIzaSyD8QJ0NhV8Sd6kGXRntcKyxT8akcoc72-c',
        },
      });

    if (
      response.status === 200 &&
      response.data.rows[0].elements[0].status !== 'ZERO_RESULTS'
    ) {
      // console.log(response.data.rows[0].elements[0].status !== 'ZERO_RESULTS');
      distance = response.data.rows[0].elements[0].distance.value / 1000;
      duration = response.data.rows[0].elements[0].duration.value / 60;
    } else {
      throw new NotFoundException(
        'No location has been found with given coordinates',
      );
    }
    console.log(distance, duration, vehicle_type_id);

    const vehicleInfo = await this.transportationVehiclesService.findOne(
      vehicle_type_id,
    );

    if (!vehicleInfo) {
      throw new NotFoundException('Vehicle not found');
    }

    const base_fare = Number(vehicleInfo.min_fare);
    const min_km = Number(vehicleInfo.min_km);
    const max_time_in_minutes = Number(vehicleInfo.max_time_in_minutes);
    const per_km_fare = Number(vehicleInfo.per_km_fare);
    const per_minutes_fare = Number(vehicleInfo.per_minutes_fare);

    let extra_milage = 0;
    if (distance > min_km) {
      extra_milage = (distance - min_km) * per_km_fare;
    }
    let extra_minute = 0;
    if (duration > max_time_in_minutes) {
      extra_minute = (duration - max_time_in_minutes) * per_minutes_fare;
    }
    const total_cost = base_fare + extra_milage + extra_minute;
    const total_gst = total_cost * gst;
    const payable_amount = Number(total_cost) + total_gst;

    return {
      vehicle_type_id: vehicle_type_id,
      distance: distance.toFixed(2),
      duration: duration.toFixed(2),
      base_fare: base_fare.toFixed(2),
      extra_milage: extra_milage.toFixed(2),
      extra_minute: extra_minute.toFixed(2),
      total_cost: total_cost.toFixed(2),
      gst: total_gst.toFixed(2),
      Payable_amount: payable_amount.toFixed(2),
    };
  }
}

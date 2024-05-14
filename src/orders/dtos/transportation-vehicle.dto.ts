export class TransportationVehicleDto {
  id: number;
  type_id: number;
  name: string;
  code: string;
  media_url: string;
  vehicle_capacity: number;
  min_km: number;
  min_fare: number;
  per_km_fare: number;
  max_time_in_minutes: number;
  per_minutes_fare: number;
  active: boolean;
}

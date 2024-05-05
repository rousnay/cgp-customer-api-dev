export class TransportationVehicleDto {
  id: number;
  type_id: number;
  vehicle_capacity: number;
  min_km: number;
  min_fare: number;
  per_km_fare: number;
  max_time_in_minutes: number;
  per_minutes_fare: number;
  cf_media_id: number;
  active: boolean;
}

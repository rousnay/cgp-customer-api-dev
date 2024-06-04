import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeoLocationService } from './services/geolocation.service';
import { GeoLocationController } from './controllers/geolocation.controller';

@Module({
  //   imports: [TypeOrmModule.forFeature([])],
  //   exports: [GeoLocationService],
  providers: [GeoLocationService],
  controllers: [GeoLocationController],
})
export class GeoLocationModule {}

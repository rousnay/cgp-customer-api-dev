import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationGateway } from './location.gateway';
import { LocationSchema } from './schemas/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Location', schema: LocationSchema }]),
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationGateway],
})
export class LocationModule {}

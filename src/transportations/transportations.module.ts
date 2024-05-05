import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportationVehiclesController } from './controllers/transportation-vehicles.controller';
import { TransportationVehiclesService } from './services/transportation-vehicles.service';
import { TransportationOrders } from './entities/transportation-orders.entity';
import { TransportationOrdersService } from './services/transportation-orders.service';
import { TransportationOrdersController } from './controllers/transportation-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransportationVehiclesService,
      TransportationOrdersService,
      TransportationOrders,
    ]),
  ],
  controllers: [
    TransportationVehiclesController,
    TransportationOrdersController,
  ],
  providers: [TransportationVehiclesService, TransportationOrdersService],
})
export class TransportationsModule {}

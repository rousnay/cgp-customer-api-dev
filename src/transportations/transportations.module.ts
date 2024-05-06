import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportationVehiclesController } from './controllers/transportation-vehicles.controller';
import { TransportationVehiclesService } from './services/transportation-vehicles.service';
import { TransportationOrders } from './entities/transportation-orders.entity';
import { TransportationOrdersService } from './services/transportation-orders.service';
import { TransportationOrdersController } from './controllers/transportation-orders.controller';
import { TransportationCostCalculationService } from './services/transportation-cost-calculation.service';
import { TransportationCostCalculationController } from './controllers/transportation-cost-calculation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransportationVehiclesService,
      TransportationOrdersService,
      TransportationCostCalculationService,
      TransportationOrders,
    ]),
  ],
  controllers: [
    TransportationVehiclesController,
    TransportationCostCalculationController,
    TransportationOrdersController,
  ],
  providers: [
    TransportationVehiclesService,
    TransportationCostCalculationService,
    TransportationOrdersService,
  ],
})
export class TransportationsModule {}

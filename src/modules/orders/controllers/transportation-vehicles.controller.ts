import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { TransportationVehiclesService } from '../services/transportation-vehicles.service';
import { TransportationVehicleDto } from '../dtos/transportation-vehicle.dto';

@ApiTags('Transportation')
@Controller('transportation/vehicles')
export class TransportationVehiclesController {
  constructor(
    private readonly transportationVehiclesService: TransportationVehiclesService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all transportation vehicles' })
  @ApiResponse({ status: 200, type: [TransportationVehiclesService] })
  async findAll(): Promise<{
    status: string;
    message: string;
    data: TransportationVehicleDto[];
  }> {
    const transportationVehicles =
      await this.transportationVehiclesService.findAll();
    if (!transportationVehicles) {
      throw new NotFoundException('Transportation Vehicles not found');
    }
    return {
      status: 'success',
      message: 'Transportation vehicles fetched successfully',
      data: transportationVehicles,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get transportation vehicle by id' })
  async findOne(@Param('id') id: number): Promise<{
    status: string;
    message: string;
    data: TransportationVehicleDto;
  }> {
    const vehicle = await this.transportationVehiclesService.findOne(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return {
      status: 'success',
      message: 'The transportation vehicle has fetched successfully',
      data: vehicle,
    };
  }
}

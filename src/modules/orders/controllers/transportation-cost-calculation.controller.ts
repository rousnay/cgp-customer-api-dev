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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { TransportationCostCalculationService } from '../services/transportation-cost-calculation.service';
import { CalculateTransportationCostDto } from '../dtos/calculate-transportation-cost.dto';

@ApiTags('Transportation')
@Controller('transportation/calculate')
export class TransportationCostCalculationController {
  constructor(
    private readonly transportationCostCalculationService: TransportationCostCalculationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Calculate Transportation Cost' })
  @ApiBody({ type: CalculateTransportationCostDto })
  async calculate(
    @Body() createTransportationOrderDto: CalculateTransportationCostDto,
  ): Promise<{
    status: string;
    message: string;
    data: any;
  }> {
    const order = await this.transportationCostCalculationService.calculate(
      createTransportationOrderDto,
    );

    return {
      status: 'success',
      message: 'Transportation cost has been calculated successfully',
      data: order,
    };
  }
}

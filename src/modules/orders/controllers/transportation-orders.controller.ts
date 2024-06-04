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
  ValidationPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CreateTransportationOrderDto } from '../dtos/create-transportation-order.dto';
import { TransportationOrdersService } from '../services/transportation-orders.service';

@ApiTags('Transportation')
@Controller('transportation/orders')
export class TransportationOrdersController {
  constructor(
    private readonly transportationOrdersService: TransportationOrdersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create Transportation Order' })
  @ApiBody({ type: CreateTransportationOrderDto })
  @ApiQuery({
    name: 'payment_client',
    type: 'string',
    required: true,
    description: 'Payment client type',
    enum: ['web', 'app'],
  })
  async create(
    @Query('payment_client') payment_client: string,
    @Body() createTransportationOrderDto: CreateTransportationOrderDto,
  ): Promise<{
    status: string;
    message: string;
    data: CreateTransportationOrderDto;
  }> {
    const order = await this.transportationOrdersService.create(
      payment_client,
      createTransportationOrderDto,
    );

    return {
      status: 'success',
      message: 'Transportation Order placed successfully',
      data: order,
    };
  }
}

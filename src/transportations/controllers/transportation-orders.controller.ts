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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransportationOrdersService } from '../services/transportation-orders.service';
import { CreateTransportationOrderDto } from '../dtos/create-transportation-order.dto';

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
  async create(
    @Body() createTransportationOrderDto: CreateTransportationOrderDto,
  ): Promise<{
    status: string;
    message: string;
    data: CreateTransportationOrderDto;
  }> {
    const order = await this.transportationOrdersService.create(
      createTransportationOrderDto,
    );

    return {
      status: 'success',
      message: 'Transportation Order placed successfully',
      data: order,
    };
  }
}

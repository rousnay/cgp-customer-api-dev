import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderCancelReasonService } from '../services/order-cancel-reason.service';
import { CreateOrderCancelReasonDto } from '../dtos/create-order-cancel-reason.dto';
import { UpdateOrderCancelReasonDto } from '../dtos/update-order-cancel-reason.dto';
import { OrderCancelReason } from '../entities/order-cancel-reason.entity';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { OrderCancelReasonType } from '@common/enums/order.enum';

@ApiTags('Order Cancel Reasons')
@Controller('order-cancel-reasons')
export class OrderCancelReasonController {
  constructor(
    private readonly orderCancelReasonService: OrderCancelReasonService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all order cancel reasons' })
  @ApiResponse({
    status: 200,
    description: 'List of all order cancel reasons',
    type: OrderCancelReason,
    isArray: true,
  })
  async findAll(): Promise<any> {
    const allReasons = await this.orderCancelReasonService.findAll();
    return {
      status: 'success',
      message: 'Order cancel reasons has been fetched successfully',
      data: allReasons,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get an order cancel reason by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Order cancel reason ID' })
  @ApiResponse({
    status: 200,
    description: 'The found order cancel reason',
    type: OrderCancelReason,
  })
  @ApiResponse({ status: 404, description: 'Order cancel reason not found' })
  async findById(@Param('id') id: string): Promise<any> {
    const theReason = await this.orderCancelReasonService.findById(+id);
    return {
      status: 'success',
      message: 'Order cancel reason by id has been fetched successfully',
      data: theReason,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create an order cancel reason' })
  //   @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateOrderCancelReasonDto })
  @ApiResponse({
    status: 201,
    description: 'Order cancel reason created',
    type: OrderCancelReason,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async create(
    @Body() createDto: CreateOrderCancelReasonDto,
    // @Body() formData: CreateOrderCancelReasonDto,
  ): Promise<any> {
    const theReason = await this.orderCancelReasonService.create(createDto);
    return {
      status: 'success',
      message: 'Order cancel reason has been created successfully',
      data: theReason,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update an order cancel reason by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Order cancel reason ID' })
  @ApiBody({ type: UpdateOrderCancelReasonDto })
  @ApiResponse({
    status: 200,
    description: 'Order cancel reason updated',
    type: OrderCancelReason,
  })
  @ApiResponse({ status: 404, description: 'Order cancel reason not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderCancelReasonDto,
  ): Promise<any> {
    const theReason = await this.orderCancelReasonService.update(
      +id,
      updateDto,
    );
    return {
      status: 'success',
      message: 'Order cancel reason has been created successfully',
      data: theReason,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Delete an order cancel reason by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Order cancel reason ID' })
  @ApiResponse({ status: 204, description: 'Order cancel reason deleted' })
  @ApiResponse({ status: 404, description: 'Order cancel reason not found' })
  delete(@Param('id') id: string) {
    return this.orderCancelReasonService.delete(+id);
  }
}

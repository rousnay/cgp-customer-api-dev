import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DeliveryRequestService } from './delivery-request.service';
import { CreateDeliveryRequestDto } from './dtos/create-delivery-request.dto';
import { UpdateDeliveryRequestDto } from './dtos/update-delivery-request.dto';
import { DeliveryRequest } from './schemas/delivery-request.schema';

@ApiTags('Delivery Requests')
@Controller('delivery-requests')
export class DeliveryRequestController {
  constructor(
    private readonly deliveryRequestService: DeliveryRequestService,
  ) {}

  @Post('create-delivery-request/:stripeId')
  @ApiOperation({ summary: 'Create a delivery request from Stripe ID' })
  @ApiParam({
    name: 'stripeId',
    description: 'The Stripe ID associated with the payment',
  })
  async createDeliveryRequestFromStripeId(
    @Param('stripeId') stripeId: string,
  ): Promise<any> {
    try {
      console.log('createDeliveryRequestFromStripeId called!');
      console.log('stripeId', stripeId);
      const payload =
        await this.deliveryRequestService.createDeliveryRequestFromStripeId(stripeId);
      console.log('payload', payload);
      const result = await this.deliveryRequestService.create(payload);
      console.log('result', result);

      return result;
    } catch (error) {
      if (error.message === 'No data found for the provided stripe_id') {
        throw new HttpException(
          'No data found for the provided Stripe ID.',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Internal server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new delivery request' })
  @ApiResponse({
    status: 201,
    description: 'The delivery request has been successfully created.',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiBody({ type: CreateDeliveryRequestDto })
  async create(
    @Body() createDeliveryRequestDto: CreateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestService.create(createDeliveryRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery requests' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of delivery requests',
    type: [DeliveryRequest],
  })
  async findAll(): Promise<DeliveryRequest[]> {
    return this.deliveryRequestService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery request by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the delivery request' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of the delivery request',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 404, description: 'Delivery request not found' })
  async findOne(@Param('id') id: string): Promise<DeliveryRequest> {
    return this.deliveryRequestService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a delivery request by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the delivery request' })
  @ApiResponse({
    status: 200,
    description: 'The delivery request has been successfully updated.',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 404, description: 'Delivery request not found' })
  @ApiBody({ type: CreateDeliveryRequestDto })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateDeliveryRequestDto>,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestService.update(id, updateData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a delivery request by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the delivery request' })
  @ApiResponse({
    status: 200,
    description: 'The delivery request has been successfully updated.',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 404, description: 'Delivery request not found' })
  @ApiBody({ type: UpdateDeliveryRequestDto })
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateDeliveryRequestDto: UpdateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    if (updateDeliveryRequestDto.status) {
      await this.deliveryRequestService.updateStatus(
        id,
        updateDeliveryRequestDto.status,
      );
    }
    if (updateDeliveryRequestDto.assignedRider) {
      await this.deliveryRequestService.updateAssignedRider(
        id,
        updateDeliveryRequestDto.assignedRider,
      );
    }
    return this.deliveryRequestService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a delivery request by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the delivery request' })
  @ApiResponse({
    status: 200,
    description: 'The delivery request has been successfully deleted.',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 404, description: 'Delivery request not found' })
  async delete(@Param('id') id: string): Promise<DeliveryRequest> {
    return this.deliveryRequestService.delete(id);
  }
}

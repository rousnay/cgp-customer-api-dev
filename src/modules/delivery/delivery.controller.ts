import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DeliveryService } from './services/delivery.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { DeliveryRequest } from './schemas/delivery-request.schema';
import { DeliveryRequestService } from './services/delivery-request.service';
import { UpdateDeliveryRequestDto } from './dtos/update-delivery-request.dto';
import { CreateDeliveryRequestDto } from './dtos/create-delivery-request.dto';

@Controller('deliveries')
@ApiTags('Deliveries')
export class DeliveryController {
  constructor(
    private deliveryService: DeliveryService,
    private readonly deliveryRequestService: DeliveryRequestService,
  ) {}

  @Post('send-request')
  //   @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (token)' })
  //   @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'number',
          example: '12345',
        },
        stripeId: {
          type: 'string',
          example: 'cus_QTlJQ7xSGqe4jY',
        },
      },
      required: ['orderId', 'stripeId'],
    },
  })
  async sendRequest(
    @Body('orderId') orderId: number,
    @Body('stripeId') stripeId: string,
  ): Promise<any> {
    const requestResult = await this.deliveryRequestService.sendDeliveryRequest(
      orderId,
      stripeId,
    );

    return {
      status: 'success',
      message: 'The delivery request has been successfully sent',
      data: requestResult,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery requests' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of delivery requests',
    type: [DeliveryRequest],
  })
  async findAll(): Promise<{
    status: string;
    message: string;
    data: DeliveryRequest[];
  }> {
    const requests = await this.deliveryService.findAll();
    return {
      status: 'success',
      message: 'Successful retrieval of delivery requests',
      data: requests,
    };
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
  async findOne(
    @Param('id') id: string,
  ): Promise<{ status: string; message: string; data: DeliveryRequest }> {
    const request = await this.deliveryService.findOne(id);
    console.log(request);
    return {
      status: 'success',
      message: 'Successful retrieval of the delivery request',
      data: request,
    };
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
    return this.deliveryService.update(id, updateData);
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
  ): Promise<{ status: string; message: string; data: DeliveryRequest }> {
    if (updateDeliveryRequestDto.status) {
      await this.deliveryService.updateStatus(
        id,
        updateDeliveryRequestDto.status,
      );
    }
    if (updateDeliveryRequestDto.assignedRider) {
      await this.deliveryService.updateAssignedRider(
        id,
        updateDeliveryRequestDto.assignedRider,
      );
    }
    const request = await this.deliveryService.findOne(id);

    return {
      status: 'success',
      message: 'The delivery request has been successfully updated.',
      data: request,
    };
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
    return this.deliveryService.delete(id);
  }
}

import {
  Headers,
  Req,
  Res,
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UsePipes,
  UseGuards,
  NotFoundException,
  Put,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { LocationService } from '@modules/location/location.service';
import { CreatePaymentTokenDto } from './dtos/create-payment-token.dto';
import { RetrievePaymentMethodDto } from './dtos/retrieve-payment-method.dto';
import { PaymentService } from './payments.service';
import { DeliveryRequestService } from '@modules/delivery/delivery-request.service';

@Controller('payment')
@ApiTags('Payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly locationService: LocationService,
    private readonly deliveryRequestService: DeliveryRequestService,
  ) {}

  @Post('tokenize')
  @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (token)' })
  @UseGuards(JwtAuthGuard)
  async tokenizeAndStorePaymentInformation(
    @Body() createPaymentTokenDto: CreatePaymentTokenDto,
  ): Promise<string> {
    return this.paymentService.tokenizeAndStorePaymentInformation(
      createPaymentTokenDto,
    );
  }

  @Post('retrieve-method')
  @ApiOperation({ summary: 'PLEASE IGNORE! UNDER DEVELOPMENT' })
  async retrievePaymentMethod(
    @Body() retrievePaymentMethodDto: RetrievePaymentMethodDto,
  ): Promise<any> {
    return this.paymentService.retrievePaymentMethod(retrievePaymentMethodDto);
  }

  @Put('update-payment-status')
  @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (webhook)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stripe_id: { type: 'string', example: 'stripe_12345' },
        payment_status: { type: 'string', example: 'succeeded' },
      },
    },
  })
  async updatePaymentStatus(
    @Body('stripe_id') stripe_id: string,
    @Body('payment_status') payment_status: string,
  ): Promise<number> {
    return this.paymentService.updatePaymentStatus(stripe_id, payment_status);
  }

  @Post('webhook-receiver')
  @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (webhook)' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    // console.log('signature', signature);
    console.log('webhook-receiver called!');
    try {
      const rawPayload = req.rawBody; // Access the raw request body
      await this.paymentService.handleWebhookEvent(rawPayload, signature);
      res.status(200).end();
    } catch (error) {
      // Handle any errors that occur during webhook event handling
      console.error('Error handling webhook event', error.message);
      throw new Error('Error handling webhook event');
    }
  }

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
        await this.paymentService.createDeliveryRequestFromStripeId(stripeId);
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
}

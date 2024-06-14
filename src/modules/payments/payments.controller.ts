import {
  Headers,
  Req,
  Res,
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CreatePaymentTokenDto } from './dtos/create-payment-token.dto';
import { RetrievePaymentMethodDto } from './dtos/retrieve-payment-method.dto';
import { PaymentService } from './payments.service';

@Controller('payment')
@ApiTags('Payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
        stripe_id: {
          type: 'string',
          example:
            'cs_test_a1ZPTibt206umm3NxH9MSIPr4EL2LCcot5UVpgpwZNM0vYMiWjwdfn7h7I',
        },
        payment_status: { type: 'string', example: 'Paid' },
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
}

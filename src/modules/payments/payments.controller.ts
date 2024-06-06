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
import { CreatePaymentTokenDto } from './dtos/create-payment-token.dto';
import { RetrievePaymentMethodDto } from './dtos/retrieve-payment-method.dto';
import { StripeService } from './services/stripe.service';
import { PaymentService } from './services/payments.service';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (session)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async createCheckoutSession(@Body() products: any[]): Promise<any> {
    try {
      const session = await this.stripeService.createCheckoutSession(products);
      return { sessionId: session.id };
    } catch (error) {
      // Handle any errors that occur during session creation
      console.error('Error creating checkout session:', error.message);
      throw new Error('Error creating checkout session');
    }
  }

  @Post('tokenize')
  async tokenizeAndStorePaymentInformation(
    @Body() createPaymentTokenDto: CreatePaymentTokenDto,
  ): Promise<string> {
    return this.paymentService.tokenizeAndStorePaymentInformation(
      createPaymentTokenDto,
    );
  }

  @Post('retrieve-method')
  async retrievePaymentMethod(
    @Body() retrievePaymentMethodDto: RetrievePaymentMethodDto,
  ): Promise<any> {
    return this.paymentService.retrievePaymentMethod(retrievePaymentMethodDto);
  }

  // @Post('webhook-receiver')
  // @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (webhook)' })
  // async handleStripeWebhook(
  //   @Headers('stripe-signature') signature: string,
  //   @Req() req: any,
  //   @Res() res: any,
  // ): Promise<void> {
  //   try {
  //     const rawPayload = req.rawBody; // Access the raw request body
  //     await this.stripeService.handleWebhookEvent(rawPayload, signature);
  //     res.status(200).end();
  //   } catch (error) {
  //     // Handle any errors that occur during webhook event handling
  //     console.error('Error handling webhook event', error.message);
  //     throw new Error('Error handling webhook event');
  //   }
  // }
}

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
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Create Checkout Session' })
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

  @Post('webhook-receiver')
  @ApiOperation({ summary: 'Stripe Webhook Receiver' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    try {
      const rawPayload = req.rawBody; // Access the raw request body
      await this.stripeService.handleWebhookEvent(rawPayload, signature);
      res.status(200).end();
    } catch (error) {
      // Handle any errors that occur during webhook event handling
      console.error('Error handling webhook event', error.message);
      throw new Error('Error handling webhook event');
    }
  }
}

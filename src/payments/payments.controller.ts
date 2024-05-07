// payment/payment.controller.ts
import { Controller, Post, Body, Headers, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
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
  async handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
    @Res() res: any,
  ): Promise<void> {
    try {
      //   console.log('payload 1', payload);
      //   console.log('signature 1', signature);
      const rawPayload = req.rawBody; // Access the raw request body
      await this.stripeService.handleWebhookEvent(rawPayload, signature);
      res.status(200).end();
    } catch (error) {
      // Handle any errors that occur during webhook event handling
      console.error('Error handling webhook event 1:', error.message);
      throw new Error('Error handling webhook event 1');
    }
  }
}

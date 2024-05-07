// payment/stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateTransportationOrderDto } from 'src/transportations/dtos/create-transportation-order.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY ||
      'sk_test_51IwUmlIl61pF9onu7EMHKhmQhSTAeMkQBdOYnRLlP1GmfIkH2KLHO0FRdFp1e3oLOcHnKzYSXRjjTRa7YIIYlgQG00e7Jr959f';
    this.stripe = new Stripe(
      // this.configService.get('STRIPE_CONFIG.apiKey')
      stripeSecretKey,
      {
        apiVersion: '2024-04-10', // Choose the Stripe API version
      },
    );
  }

  async createCheckoutSession(
    products: any[],
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'], // Payment method types allowed (e.g., card)
        line_items: products.map((product) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100, // Price of the product in cents
          },
          quantity: product.quantity,
        })),
        mode: 'payment', // Payment mode (e.g., payment, subscription)
        success_url: 'https://raw-bertie-wittyplex.koyeb.app/',
        cancel_url: 'https://raw-bertie-wittyplex.koyeb.app/',
      });

      return session;
    } catch (error) {
      throw new Error(`Error creating checkout session: ${error.message}`);
    }
  }

  async processTransportationOrderPayment(
    order: any,
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Create a checkout session with Stripe
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'aud',
              product_data: {
                name: 'Transportation Service', // Customize as needed
              },
              unit_amount: order.payable_amount * 100, // Stripe requires amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        // customer_details: {
        //   // address:
        //   //   "{ 'line1': '123 Main St', 'city': 'San Francisco', 'state': 'CA', 'postal_code': '94105', 'country': 'US' }",
        //   email: order.email,
        //   // name: order.name,
        //   // phone: '01234567890',
        // },
        // customer: {
        //   name: order.name, // Include user's name in the payment request
        // },
        // customer_name: "John Doe",
        // customer_phone: '01234567890',
        // customer_address:
        //   '{ "line1": "123 Main St", "city": "San Francisco", "state": "CA", "postal_code": "94105", "country": "US" }',
        customer_email: order.email,
        success_url: 'https://raw-bertie-wittyplex.koyeb.app/', // Redirect URL after successful payment
        cancel_url: 'https://raw-bertie-wittyplex.koyeb.app/', // Redirect URL if payment is canceled
      });

      // Return the session ID to redirect the user to Stripe Checkout
      return session;
    } catch (error) {
      console.error('Error processing payment:', error.message);
      throw new Error('Error processing payment');
    }
  }

  async handleWebhookEvent(
    rawPayload: string,
    signature: string,
  ): Promise<void> {
    try {
      // Verify the webhook signature to ensure it's coming from Stripe
      //   const webhookSecret = this.configService.get(
      //     'STRIPE_CONFIG.webhookConfig.stripeSecrets.account',
      //   );
      const webhookSecret =
        process.env.STRIPE_WEBHOOK_SECRET ||
        'whsec_188a7685862251b9d8a65355ce3d3fbf64341be616f7ee2fffe6322b2d7baa2f';

      const event = this.stripe.webhooks.constructEvent(
        rawPayload,
        signature,
        webhookSecret,
      );

      // Handle the event based on its type
      switch (event.type) {
        case 'payment_intent.canceled':
          const canceledPaymentIntent = event.data
            .object as Stripe.PaymentIntent;
          // Handle canceled payment event
          console.log('PaymentIntent was canceled:', canceledPaymentIntent.id);
          break;

        case 'payment_intent.created':
          const createdPaymentIntent = event.data
            .object as Stripe.PaymentIntent;
          // Handle created payment event
          console.log('PaymentIntent was created:', createdPaymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
          // Handle failed payment event
          console.log('PaymentIntent failed:', failedPaymentIntent.id);
          break;

        case 'payment_intent.processing':
          const processingPaymentIntent = event.data
            .object as Stripe.PaymentIntent;
          // Handle processing payment event
          console.log(
            'PaymentIntent is processing:',
            processingPaymentIntent.id,
          );
          break;

        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // Handle successful payment event
          console.log('PaymentIntent was successful:', paymentIntent.id);
          break;
        // Add more cases for other event types as needed
        default:
          console.log('Unhandled event type:', event.type);
      }
    } catch (error) {
      // Handle webhook verification or processing errors
      console.error('Error handling webhook event:', error.message);
      throw new Error('Webhook event handling failed');
    }
  }
}

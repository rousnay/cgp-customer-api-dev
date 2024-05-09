// payment/stripe.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateTransportationOrderDto } from 'src/transportations/dtos/create-transportation-order.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @Inject(REQUEST) private readonly request: Request,
  ) {
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

  async createPaymentIntent(payableAmount: number): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: payableAmount,
        currency: 'aud',
      });
      return paymentIntent.client_secret;
    } catch (error) {
      throw new Error('Failed to create payment intent');
    }
  }

  async processTransportationOrderPayment(
    order: any,
  ): Promise<Stripe.Checkout.Session> {
    const user = this.request['user'];
    console.log('order', order);
    try {
      // Create a customer in Stripe
      const customer = await this.stripe.customers.create({
        email: user.email, // Required
        name: user.first_name + ' ' + user.last_name, // Optional
        phone: user.phone, // Optional
        // address: {
        //   line1: '123 Main St',
        //   city: 'San Francisco',
        //   state: 'CA',
        //   postal_code: '94105',
        //   country: 'US',
        // }, // Optional
        description: 'Transportation order customer', // Optional
        metadata: {
          vehicle_type_id: order.vehicle_type_id,
          total_cost: order.total_cost,
          gst: order.gst,
          payable_amount: order.payable_amount,
          pickup_address_coordinates: order.pickup_address_coordinates,
          shipping_address_coordinates: order.shipping_address_coordinates,
        }, // Optional
        shipping: {
          address: {
            line1: order.shipping_address.address,
            city: order.shipping_address.city,
            state: order.shipping_address.state,
            postal_code: order.shipping_address.postal_code,
            country: 'AU',
          },
          name:
            order.shipping_address.first_name +
            ' ' +
            order.shipping_address.last_name,
          phone: order.shipping_address.phone_number_1,
        }, // Optional
        // payment_method: 'pm_1PE9VPGJkp9au0iQJj9pxwaB', // Optional: Attach an existing payment method
      });
      console.log('user', user);
      console.log('customer', customer);

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
        // payment_method: 'pm_1PE9VPGJkp9au0iQJj9pxwaB',
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
        customer: customer.id,
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
        'whsec_9c0f4abf9746e0a1f68e0f753a5989586ae6f135cc25699cb4af719793df8372';

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

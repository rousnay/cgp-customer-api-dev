import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { CreatePaymentTokenDto } from '../dtos/create-payment-token.dto';
import { PaymentToken } from '../entities/payment-token.entity';
import { RetrievePaymentMethodDto } from '../dtos/retrieve-payment-method.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentToken)
    private paymentTokenRepository: Repository<PaymentToken>,
  ) {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY ||
      'sk_test_51PE2ezGJkp9au0iQvH2fEFk2YP2IXDwgMCP71xwuoem6cssGg6dKkKk8SMhsz5EzbzYkcwdpNzr7oV689IbtF0Nr00UdZYlfrE';
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10',
    });
  }

  async tokenizeAndStorePaymentInformation(
    createPaymentTokenDto: CreatePaymentTokenDto,
  ): Promise<string> {
    console.log('createPaymentTokenDto', createPaymentTokenDto);
    // const paymentMethod = await this.stripe.paymentMethods.create({
    //   type: 'card',
    //   card: {
    //     number: createPaymentTokenDto.cardNumber,
    //     exp_month: createPaymentTokenDto.expMonth,
    //     exp_year: createPaymentTokenDto.expYear,
    //     cvc: createPaymentTokenDto.cvc,
    //   },
    // });

    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Use test card token provided by Stripe
      },
    });

    const paymentToken = paymentMethod.id;
    const newPaymentToken = this.paymentTokenRepository.create({
      customerId: createPaymentTokenDto.customerId,
      paymentToken: paymentToken,
    });
    await this.paymentTokenRepository.save(newPaymentToken);

    return paymentToken;
  }

  async retrievePaymentMethod(
    retrievePaymentMethodDto: RetrievePaymentMethodDto,
  ): Promise<Stripe.PaymentMethod> {
    try {
      // Retrieve stored payment method associated with the customer's identifier
      const paymentToken = await this.paymentTokenRepository.findOne({
        where: { customerId: retrievePaymentMethodDto.customerId },
      });

      console.log('paymentToken', paymentToken);

      // Retrieve default payment method ID from Stripe customer
      //   const customer = await this.stripe.customers.retrieve(
      //     retrievePaymentMethodDto.customerId,
      //   );

      //   console.log('customer', customer);

      //   // Check if invoice_settings exists on customer
      //   if (!customer.invoice_settings) {
      //     throw new Error('Invoice settings not found for customer');
      //   }

      //   const defaultPaymentMethodId =
      //     customer.invoice_settings.default_payment_method;

      const paymentMethodId = 'pm_1PE9EYGJkp9au0iQEEZC9mnq';

      //   // Check if invoice_settings exists on customer
      //   if (!('invoice_settings' in customer)) {
      //     throw new Error('Invoice settings not found for customer');
      //   }

      //   const defaultPaymentMethodId =
      //     customer.invoice_settings.default_payment_method;

      //   // If the default payment method is a PaymentMethod object, retrieve its ID
      // paymentMethodId =
      //     typeof defaultPaymentMethodId === 'string'
      //       ? defaultPaymentMethodId
      //       : defaultPaymentMethodId.id;

      console.log('paymentMethodId', paymentMethodId);

      // Retrieve payment method details from Stripe using default payment method ID
      return await this.stripe.paymentMethods.retrieve(paymentMethodId);
      //   const await this.stripe.customers.retrievePaymentMethod(
      //     'cus_9s6XKzkNRiz8i3',
      //     'pm_1NVChw2eZvKYlo2CHxiM5E2E',
      //   );
    } catch (error) {
      console.error('Error retrieving payment method:', error.message);
      throw new Error('Error retrieving payment method');
    }
  }
}

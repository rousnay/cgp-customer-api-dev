import { HttpException, Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { AddPaymentMethodDto } from '../dtos/add-payment-method.dto';
import { REQUEST } from '@nestjs/core';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@config/config.service';
import { AppConstants } from '@common/constants/constants';

@Injectable()
export class PaymentMethodService {
  private stripe: Stripe;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.stripeSecretKey, {
      apiVersion: AppConstants.stripe.apiVersion,
    });
  }
  async addPaymentMethod(
    addPaymentMethodData: AddPaymentMethodDto,
  ): Promise<any> {
    const { pmID, isDefault } = addPaymentMethodData;
    // find customer stripe id from database
    const user = this.request['user'];
    const name = user.name;
    const userEmail = user.email;

    if (!userEmail) {
      throw new HttpException('User email not found', 404);
    }
    // find customer stripe id from database
    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [userEmail],
    );

    if (customerDetails.length === 0) {
      throw new HttpException('Customer not found', 404);
    }
    let customerStripeId = customerDetails[0]?.stripe_id;
    // if customer stripe id exists, attach payment method
    if (customerStripeId) {
      // attach payment method
      try {
        customerStripeId = await this.stripe.customers
          .retrieve(customerStripeId)
          .then((res) => res.id);
      } catch (e) {
        customerStripeId = await this.stripe.customers
          .create({
            email: userEmail,
            name: name,
          })
          .then((res) => res.id);
      }
      console.log('gg');
      const attachPaymentMethodResult = await this.stripe.paymentMethods.attach(
        pmID,
        {
          customer: customerStripeId,
        },
      );

      // set default payment method
      if (isDefault) {
        const setDefaultResult = await this.stripe.customers.update(
          customerStripeId,
          {
            invoice_settings: {
              default_payment_method: pmID,
            },
          },
        );

        return {
          attachPaymentMethodResult,
          setDefaultResult,
        };
      }
      return {
        attachPaymentMethodResult,
        setDefaultResult: null,
      };
    } else {
      // if customer stripe id does not exist, create customer and attach payment method
      const createCustomerResult = await this.stripe.customers.create({
        email: userEmail,
        name: name,
      });

      // update user stripe id
      await this.entityManager.query(
        'UPDATE users SET stripe_id = ? WHERE email = ?',
        [createCustomerResult.id, userEmail],
      );

      // attach payment method
      const attachPaymentMethodResult = await this.stripe.paymentMethods.attach(
        pmID,
        {
          customer: createCustomerResult.id,
        },
      );

      // set default payment method
      if (isDefault) {
        const setDefaultResult = await this.stripe.customers.update(
          createCustomerResult.id,
          {
            invoice_settings: {
              default_payment_method: pmID,
            },
          },
        );
        return {
          attachPaymentMethodResult,
          setDefaultResult,
        };
      }
      return {
        attachPaymentMethodResult,
        setDefaultResult: null,
      };
    }
  }

  async setDefaultPaymentMethod(pmID: string): Promise<any> {
    const user = this.request['user'];
    const userEmail = user.email;
    if (!userEmail) {
      throw new HttpException('User email not found', 404);
    }
    // find customer stripe id from database
    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [userEmail],
    );
    if (customerDetails.length === 0) {
      throw new HttpException('Customer not found', 404);
    }
    const customerStripeId = customerDetails[0]?.stripe_id;
    // if customer stripe id exists, set default payment method
    if (customerStripeId) {
      // set default payment method
      const setDefaultResult = await this.stripe.customers.update(
        customerStripeId,
        {
          invoice_settings: {
            default_payment_method: pmID,
          },
        },
      );
      return setDefaultResult;
    } else {
      // if customer stripe id does not exist, throw error
      throw new HttpException('Customer not found', 404);
    }
  }

  async getAllPaymentMethodByUser(): Promise<any> {
    // this customerid is from database (mysql or mongodb),
    const user = this.request['user'];
    const userEmail = user.email;
    if (!userEmail) {
      throw new HttpException('User not found', 404);
    }
    // find customer stripe id from database
    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [userEmail],
    );
    if (customerDetails.length === 0) {
      throw new HttpException('Customer not found', 404);
    }
    const customerStripeId = customerDetails[0]?.stripe_id;

    // if not find this customer
    if (!customerStripeId) {
      return {
        paymentMethodList: [],
        customer: null,
      };
    }
    // find this customer
    const customer = await this.stripe.customers.retrieve(customerStripeId);
    // find this customer all payment methods
    const paymentMethodList = await this.stripe.customers.listPaymentMethods(
      customerStripeId,
      {
        type: 'card',
        limit: 100,
      },
    );
    return {
      paymentMethodList,
      customer,
    };
  }

  async deletePaymentMethod(pmID: string): Promise<any> {
    // delete this payment method
    const user = this.request['user'];
    const userEmail = user.email;
    if (!userEmail) {
      throw new HttpException('User email not found', 404);
    }
    // find customer stripe id from database
    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [userEmail],
    );
    if (customerDetails.length === 0) {
      throw new HttpException('Customer not found', 404);
    }
    const customerStripeId = customerDetails[0]?.stripe_id;
    // if not find this customer stripe id
    if (!customerStripeId) {
      throw new HttpException('Customer stripe id not found', 404);
    }
    // if find this customer stripe id
    const getPaymentMethodResult = await this.stripe.paymentMethods.retrieve(
      pmID,
    );
    // if not find this payment method
    if (!getPaymentMethodResult) {
      throw new HttpException('Payment method not found', 404);
    }
    // if the payment method not belong to this customer
    if (getPaymentMethodResult.customer !== customerStripeId) {
      throw new HttpException('You cannot delete this payment method', 404);
    }
    // if the payment method belong to this customer, then delete this payment method
    const deletePaymentMethodResult = await this.stripe.paymentMethods.detach(
      pmID,
    );
    return deletePaymentMethodResult;
  }
}

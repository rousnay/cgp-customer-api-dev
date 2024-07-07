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
  async addPaymentMethod({ pmID, isDefault }: AddPaymentMethodDto): Promise<
    | {
        attachPaymentMethodResult: Stripe.PaymentMethod;
        setDefaultResult: Stripe.PaymentMethod | null;
      }
    | HttpException
  > {
    let newCustomerId: string = null;
    const { email, name } = this.request['user'];

    if (!email) {
      throw new HttpException('User email not found', 404);
    }

    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    try {
      if (!customerDetails.length) {
        throw new HttpException('Customer not found', 404);
      }

      const { stripe_id: customerStripeId } = customerDetails[0];

      if (!customerStripeId) {
        const customer = await this.createCustomer(email, name);
        newCustomerId = customer.id;
        await this.updateUserStipeId(email, customer.id);
        return await this.attachAndSetDefaultPaymentMethod(
          pmID,
          customer.id,
          isDefault,
        );
      }

      const customer = await this.stripe.customers.retrieve(customerStripeId);

      if (customer.deleted) {
        const customer = await this.createCustomer(email, name);
        newCustomerId = customer.id;
        const _resultData = await this.attachAndSetDefaultPaymentMethod(
          pmID,
          customer.id,
          isDefault,
        );

        await this.updateUserStipeId(email, customer.id);
        return _resultData;
      }

      return await this.attachAndSetDefaultPaymentMethod(
        pmID,
        customerStripeId,
        isDefault,
      );
    } catch (e) {
      if (newCustomerId) {
        await this.stripe.customers.del(newCustomerId);
      }

      throw new HttpException(
        'Payment method attach failed, You can not add this payment method.',
        404,
      );
    }
  }
  private async createCustomer(
    email: string,
    name: string,
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({ email, name });
  }

  private async updateUserStipeId(
    email: string,
    stripeId: string,
  ): Promise<void> {
    await this.entityManager.query(
      'UPDATE users SET stripe_id = ? WHERE email = ?',
      [stripeId, email],
    );
  }

  private async attachAndSetDefaultPaymentMethod(
    pmID: string,
    customerStripeId: string,
    isDefault: boolean,
  ): Promise<{
    attachPaymentMethodResult: Stripe.PaymentMethod;
    setDefaultResult: any | null;
  }> {
    const attachPaymentMethodResult = await this.stripe.paymentMethods.attach(
      pmID,
      { customer: customerStripeId },
    );

    if (isDefault) {
      return {
        attachPaymentMethodResult,
        setDefaultResult: await this.stripe.customers.update(customerStripeId, {
          invoice_settings: {
            default_payment_method: pmID,
          },
        }),
      };
    }

    return {
      attachPaymentMethodResult,
      setDefaultResult: null,
    };
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
    try {
      const customer = await this.stripe.customers.retrieve(customerStripeId);
      if (customer.deleted) {
        return {
          paymentMethodList: [],
          customer: null,
        };
      } else {
        const paymentMethodList =
          await this.stripe.customers.listPaymentMethods(customerStripeId, {
            type: 'card',
            limit: 100,
          });
        return {
          paymentMethodList,
          customer,
        };
      }
    } catch (e) {
      return {
        paymentMethodList: [],
        customer: null,
      };
    }
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

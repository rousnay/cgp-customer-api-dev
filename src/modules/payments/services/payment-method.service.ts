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
        status: string;
        message: string;
        data:
          | {
              attachPaymentMethodResult: Stripe.PaymentMethod;
              setDefaultResult: Stripe.PaymentMethod | null;
            }
          | any;
      }
    | HttpException
  > {
    let newCustomerId: string = null;
    const { email, name } = this.request['user'];

    if (!email) {
      return {
        status: 'error',
        message: 'Email not found',
        data: null,
      };
    }

    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    try {
      if (!customerDetails.length) {
        return {
          status: 'error',
          message: 'Customer not found',
          data: null,
        };
      }

      const { stripe_id: customerStripeId } = customerDetails[0];

      if (!customerStripeId) {
        const customer = await this.createCustomer(email, name);
        newCustomerId = customer.id;
        await this.updateUserStipeId(email, customer.id);
        const _resultData = await this.attachAndSetDefaultPaymentMethod(
          pmID,
          customer.id,
          isDefault,
        );
        return {
          status: 'success',
          message: 'Payment method attached successfully',
          data: _resultData,
        };
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

        return {
          status: 'success',
          message: 'Payment method attached successfully',
          data: _resultData,
        };
      }

      const _resultData = await this.attachAndSetDefaultPaymentMethod(
        pmID,
        customerStripeId,
        isDefault,
      );

      return {
        status: 'success',
        message: 'Payment method attached successfully',
        data: _resultData,
      };
    } catch (e) {
      if (newCustomerId) {
        await this.stripe.customers.del(newCustomerId);
      }

      return {
        status: 'error',
        message:
          'Payment method attach failed, You can not add this payment method.',
        data: null,
      };
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
    try {
      const user = this.request['user'];
      const userEmail = user.email;
      if (!userEmail) {
        return {
          status: 'error',
          message: 'User email not found',
          data: null,
        };
      }
      // find customer stripe id from database
      const customerDetails = await this.entityManager.query(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [userEmail],
      );
      if (customerDetails.length === 0) {
        return {
          status: 'error',
          message: 'Customer not found',
          data: null,
        };
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
        return {
          status: 'error',
          message: 'Customer not found',
          data: null,
        };
      }
    } catch (e) {
      return {
        status: 'error',
        message: e.message || 'Failed to set default payment method',
        data: null,
      };
    }
  }

  async getAllPaymentMethodByUser(): Promise<any> {
    // this customerid is from database (mysql or mongodb),
    const user = this.request['user'];
    const userEmail = user.email;
    if (!userEmail) {
      return {
        status: 'error',
        message: 'User email not found',
        data: null,
      };
    }
    // find customer stripe id from database
    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [userEmail],
    );
    if (customerDetails.length === 0) {
      return {
        status: 'error',
        message: 'Customer not found',
        data: {
          paymentMethodList: [],
          customer: null,
        },
      };
    }
    const customerStripeId = customerDetails[0]?.stripe_id;

    // if not find this customer
    if (!customerStripeId) {
      return {
        status: 'success',
        message: 'Customer not found',
        data: {
          paymentMethodList: [],
          customer: null,
        },
      };
    }
    // find this customer
    try {
      const customer = await this.stripe.customers.retrieve(customerStripeId);
      if (customer.deleted) {
        return {
          status: 'success',
          message: 'Customer not found',
          data: {
            paymentMethodList: [],
            customer: null,
          },
        };
      } else {
        const paymentMethodList =
          await this.stripe.customers.listPaymentMethods(customerStripeId, {
            type: 'card',
            limit: 100,
          });
        return {
          status: 'success',
          message: 'Customer found',
          data: {
            paymentMethodList,
            customer,
          },
        };
      }
    } catch (e) {
      return {
        status: 'success',
        message: 'Can not get any payment methods',
        data: {
          paymentMethodList: [],
          customer: null,
        },
      };
    }
  }

  async deletePaymentMethod(pmID: string): Promise<any> {
    // delete this payment method
    const user = this.request['user'];
    const userEmail = user.email;
    if (!userEmail) {
      return {
        status: 'error',
        message: 'User email not found',
        data: null,
      };
    }
    // find customer stripe id from database
    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [userEmail],
    );
    if (customerDetails.length === 0) {
      return {
        status: 'error',
        message: 'Customer not found',
        data: null,
      };
    }
    const customerStripeId = customerDetails[0]?.stripe_id;
    // if not find this customer stripe id
    if (!customerStripeId) {
      return {
        status: 'error',
        message: 'Customer stripe data not found',
        data: null,
      };
    }
    // if find this customer stripe id
    const getPaymentMethodResult = await this.stripe.paymentMethods.retrieve(
      pmID,
    );
    // if not find this payment method
    if (!getPaymentMethodResult) {
      return {
        status: 'error',
        message: 'Payment method not found',
        data: null,
      };
    }
    // if the payment method not belong to this customer
    if (getPaymentMethodResult.customer !== customerStripeId) {
      return {
        status: 'error',
        message: 'Payment method not belong to this customer',
        data: null,
      };
    }
    // if the payment method belong to this customer, then delete this payment method
    const deletePaymentMethodResult = await this.stripe.paymentMethods.detach(
      pmID,
    );
    return {
      status: 'success',
      message: 'Payment method deleted successfully',
      data: deletePaymentMethodResult,
    };
  }
}

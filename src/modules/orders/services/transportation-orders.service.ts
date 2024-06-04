import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StripeService } from '@modules/payments/stripe.service';
import { UserAddressBookService } from '@modules/user-address-book/user-address-book-service';
import { CreateTransportationOrderDto } from '../dtos/create-transportation-order.dto';
import { Orders } from '../entities/orders.entity';

@Injectable()
export class TransportationOrdersService {
  // private readonly stripeService: StripeService;
  constructor(
    @InjectRepository(Orders)
    private readonly transportationOrdersRepository: Repository<Orders>,
    private readonly userAddressBookService: UserAddressBookService, // Inject StripeService
    private readonly stripeService: StripeService, // Inject StripeService
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async create(
    payment_client: string,
    createTransportationOrderDto: CreateTransportationOrderDto,
  ): Promise<any> {
    const customer = this.request['user'];
    let stripeSession;
    let stripeClientSecret;
    const order = this.transportationOrdersRepository.create({
      customer_id: customer.id,
      ...createTransportationOrderDto,
    });

    if (!order) {
      throw new Error('Transportation order not created');
    }

    const pickupAddress = await this.userAddressBookService.createAddress(
      createTransportationOrderDto.pickup_address,
    );

    const shippingAddress = await this.userAddressBookService.createAddress(
      createTransportationOrderDto.shipping_address,
    );

    const processPayment = {
      payable_amount: order.payable_amount,
      shipping_address: createTransportationOrderDto.shipping_address,
      pickup_address_coordinates:
        createTransportationOrderDto.pickup_address.latitude.toString() +
        ',' +
        createTransportationOrderDto.pickup_address.longitude.toString(),
      shipping_address_coordinates:
        createTransportationOrderDto.shipping_address.latitude.toString() +
        ',' +
        createTransportationOrderDto.shipping_address.longitude.toString(),
      vehicle_type_id: createTransportationOrderDto.vehicle_type_id,
      total_cost: createTransportationOrderDto.total_cost,
      gst: createTransportationOrderDto.gst,
    };

    if (payment_client === 'web') {
      stripeSession =
        await this.stripeService.processTransportationOrderPayment(
          processPayment,
        );
    } else if (payment_client === 'app') {
      stripeClientSecret = await this.stripeService.createPaymentIntent(
        order.payable_amount,
      );
    }

    const orderSave = await this.transportationOrdersRepository.save(order);

    const orderInfo = {
      id: orderSave.id,
      customer_id: orderSave.customer_id,
      pickup_address_id: pickupAddress?.id,
      shipping_address_id: shippingAddress?.id,
      vehicle_type_id: orderSave.vehicle_type_id,
      total_cost: orderSave.total_cost,
      gst: orderSave.gst,
      payable_amount: orderSave.payable_amount,
      payment_id: orderSave.payment_id,
      order_status: orderSave.order_status,
      created_at: orderSave.created_at,
      updated_at: orderSave.updated_at,
    };

    return {
      order: orderInfo,
      session: stripeSession,
      client_secret: stripeClientSecret,
    };
  }
}

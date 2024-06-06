import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StripeService } from '@modules/payments/services/stripe.service';
import { UserAddressBookService } from '@modules/user-address-book/user-address-book-service';
import { CreateTransportationOrderDto } from '../dtos/create-transportation-order.dto';
import { Orders } from '../entities/orders.entity';
import { Deliveries } from '@modules/delivery/deliveries.entity';

@Injectable()
export class TransportationOrdersService {
  // private readonly stripeService: StripeService;
  constructor(
    @InjectRepository(Orders)
    private readonly transportationOrdersRepository: Repository<Orders>,
    private readonly userAddressBookService: UserAddressBookService, // Inject StripeService
    private readonly stripeService: StripeService, // Inject StripeService
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Deliveries)
    private readonly deliveriesRepository: Repository<Deliveries>,
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

    const savedOrder = await this.transportationOrdersRepository.save(order);

    const savedDelivery = await this.deliveriesRepository.save({
      customer_id: customer?.id,
      order_id: savedOrder?.id,
      init_distance: createTransportationOrderDto?.distance,
      init_duration: createTransportationOrderDto?.duration,
      delivery_charge: createTransportationOrderDto?.total_cost,
    });

    const processPayment = {
      order_id: savedOrder.id,
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
        processPayment,
      );
    }

    const orderInfo = {
      id: savedOrder.id,
      customer_id: savedOrder.customer_id,
      pickup_address_id: pickupAddress?.id,
      shipping_address_id: shippingAddress?.id,
      vehicle_type_id: savedOrder.vehicle_type_id,
      total_cost: savedOrder.total_cost,
      gst: savedOrder.gst,
      payable_amount: savedOrder.payable_amount,
      payment_id: savedOrder.payment_id,
      order_status: savedOrder.order_status,
      created_at: savedOrder.created_at,
      updated_at: savedOrder.updated_at,
    };

    return {
      order: orderInfo,
      delivery: savedDelivery,
      session: stripeSession,
      client_secret: stripeClientSecret,
    };
  }
}

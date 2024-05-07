import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportationOrders } from '../entities/transportation-orders.entity';
import { CreateTransportationOrderDto } from '../dtos/create-transportation-order.dto';
import { StripeService } from '../../payments/stripe.service';
import { CustomerAddressBookService } from 'src/customers/services/customer-address-book-service';

@Injectable()
export class TransportationOrdersService {
  // private readonly stripeService: StripeService;
  constructor(
    @InjectRepository(TransportationOrders)
    private readonly transportationOrdersRepository: Repository<TransportationOrders>,
    private readonly customerAddressBookService: CustomerAddressBookService, // Inject StripeService
    private readonly stripeService: StripeService, // Inject StripeService
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async create(
    createTransportationOrderDto: CreateTransportationOrderDto,
  ): Promise<any> {
    const customer_id = this.request['user'].id;
    const customer_email = this.request['user'].email;
    let stripe;
    let pickupAddress;
    let shippingAddress;
    const order = this.transportationOrdersRepository.create({
      customer_id,
      ...createTransportationOrderDto,
    });

    if (order) {
      pickupAddress = await this.customerAddressBookService.createAddress(
        createTransportationOrderDto.pickup_address,
      );

      shippingAddress = await this.customerAddressBookService.createAddress(
        createTransportationOrderDto.shipping_address,
      );

      const processPayment = {
        payable_amount: order.payable_amount,
        email: customer_email,
      };

      stripe = await this.stripeService.processTransportationOrderPayment(
        processPayment,
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
      delivery_id: orderSave.delivery_id,
      payment_id: orderSave.payment_id,
      order_status: orderSave.order_status,
      created_at: orderSave.created_at,
      updated_at: orderSave.updated_at,
    };

    return {
      order: orderInfo,
      session: stripe,
    };
  }
}

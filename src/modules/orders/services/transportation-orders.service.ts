import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PaymentService } from '@modules/payments/services/payments.service';
import { UserAddressBookService } from '@modules/user-address-book/user-address-book-service';
import { Deliveries } from '@modules/delivery/deliveries.entity';
import { CreateTransportationOrderDto } from '../dtos/create-transportation-order.dto';
import { Orders } from '../entities/orders.entity';
import { DeliveryRequestService } from '@modules/delivery/services/delivery-request.service';
import { OngoingOrder } from '../schemas/ongoing-order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentMethodService } from '@modules/payments/services/payment-method.service';

@Injectable()
export class TransportationOrdersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(Orders)
    private readonly transportationOrdersRepository: Repository<Orders>,
    @InjectRepository(Deliveries)
    private readonly deliveriesRepository: Repository<Deliveries>,
    private readonly userAddressBookService: UserAddressBookService,
    private readonly paymentService: PaymentService,
    private readonly deliveryRequestService: DeliveryRequestService,
    private paymentMethodService: PaymentMethodService,
    @InjectModel('OngoingOrder') private ongoingOrderModel: Model<OngoingOrder>,
  ) {}
  async create(
    payment_client: string,
    createTransportationOrderDto: CreateTransportationOrderDto,
  ): Promise<any> {
    const defaultPaymentMethodInfo =
      await this.paymentMethodService.hasDefaultPaymentMethod();

    if (!defaultPaymentMethodInfo.data) {
      throw new NotFoundException(
        'No default payment method found, Please add one',
      );
    }

    const customer = this.request['user'];
    let pickup_address_id: number;
    let shipping_address_id: number;

    if (createTransportationOrderDto.pickup_address_id) {
      pickup_address_id = createTransportationOrderDto.pickup_address_id;
    } else {
      const pickupAddress = await this.userAddressBookService.createAddress(
        createTransportationOrderDto.pickup_address,
      );
      pickup_address_id = pickupAddress?.id;
    }

    if (createTransportationOrderDto.shipping_address_id) {
      shipping_address_id = createTransportationOrderDto.shipping_address_id;
    } else {
      const shippingAddress = await this.userAddressBookService.createAddress(
        createTransportationOrderDto.shipping_address,
      );
      shipping_address_id = shippingAddress?.id;
    }

    const order = this.transportationOrdersRepository.create({
      customer_id: customer.id,
      pickup_address_id,
      shipping_address_id,
      ...createTransportationOrderDto,
    });

    if (!order) {
      throw new Error('Transportation order not created');
    }

    const savedOrder = await this.transportationOrdersRepository.save(order);

    const savedDelivery = await this.deliveriesRepository.save({
      customer_id: customer?.id,
      order_id: savedOrder?.id,
      init_distance: createTransportationOrderDto?.distance,
      init_duration: createTransportationOrderDto?.duration,
      delivery_charge: createTransportationOrderDto?.payable_amount,
      vehicle_type_id: createTransportationOrderDto?.vehicle_type_id,
    });

    const orderInfo = {
      id: savedOrder.id,
      customer_id: savedOrder?.customer_id,
      pickup_address_id: savedOrder?.pickup_address_id,
      shipping_address_id: savedOrder?.shipping_address_id,
      vehicle_type_id: savedOrder?.vehicle_type_id,
      total_cost: savedOrder?.total_cost,
      gst: savedOrder?.gst,
      payable_amount: savedOrder?.payable_amount,
      order_status: savedOrder?.order_status,
      created_at: savedOrder?.created_at,
      updated_at: savedOrder?.updated_at,
    };

    const savedPayment = await this.paymentService.storePaymentStatus(
      savedOrder?.id,
      null,
      'Pending',
    );

    const ongoingOrderStatus = await this.updateOngoingOrder(
      savedOrder?.id,
      savedDelivery?.id,
      savedDelivery?.shipping_status,
      'Searching for a rider',
      'Be patient, we are searching for a rider for your order',
    );

    // REQUEST FOR TRIP --- Rider to be notified, Searching....
    const deliveryRequestData =
      await this.deliveryRequestService.sendDeliveryRequest(
        customer?.user_id,
        savedOrder?.id,
      );

    return {
      order: orderInfo,
      delivery: savedDelivery,
      payment: savedPayment,
      delivery_request: deliveryRequestData,
      ongoing_delivery_status: ongoingOrderStatus,
    };
  }

  async updateOngoingOrder(
    orderId: number,
    deliveryId: number,
    shippingStatus: string,
    title: string,
    message: string,
  ): Promise<OngoingOrder> {
    const updateData: Partial<OngoingOrder> = {
      orderId,
      deliveryId,
      shippingStatus,
      title,
      message,
      updatedAt: new Date(),
    };

    let existingOrder = await this.ongoingOrderModel.findOne({ orderId });

    if (!existingOrder) {
      // Create a new order if it doesn't exist
      existingOrder = new this.ongoingOrderModel({
        ...updateData,
        createdAt: new Date(),
      });
    } else {
      // Update the existing order with the new data
      existingOrder.set(updateData);
    }

    return existingOrder.save();
  }
}

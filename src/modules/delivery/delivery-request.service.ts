import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDeliveryRequestDto } from './dtos/create-delivery-request.dto';
import { UpdateDeliveryRequestDto } from './dtos/update-delivery-request.dto';
import {
  DeliveryRequest,
  AssignedRider,
} from './schemas/delivery-request.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Deliveries } from './deliveries.entity';
import { EntityManager, Repository } from 'typeorm';
import { Orders } from '@modules/orders/entities/orders.entity';
import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
import { OrderType } from '@common/enums/order.enum';
import { ShippingStatus } from '@common/enums/delivery.enum';

@Injectable()
export class DeliveryRequestService {
  constructor(
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
    @InjectRepository(Deliveries)
    private deliveriesRepository: Repository<Deliveries>,
    private readonly entityManager: EntityManager,
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    @InjectRepository(UserAddressBook)
    private userAddressBookRepository: Repository<UserAddressBook>,
  ) {}

  async getDeliveryRequestPayloadByStripeId(stripeId: string): Promise<any> {
    console.log('getDeliveryRequestPayloadByStripeId called!');
    const payment = await this.entityManager
      .createQueryBuilder()
      .select('*')
      .from('payments', 'p')
      .where('p.stripe_id = :stripeId', {
        stripeId,
      })
      .getRawOne();

    console.log('payment', payment);

    const order = await this.ordersRepository.findOne({
      where: { id: payment?.order_id },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    console.log('order', order);

    let requestFrom, pickupLocation, dropOffLocation;

    if (
      order.order_type === OrderType.PRODUCT_AND_TRANSPORT ||
      order.order_type === OrderType.WAREHOUSE_TRANSPORTATION
    ) {
      const warehouseId = order.warehouse_id;
      // const warehouse = await this.entityManager
      //   .createQueryBuilder()
      //   .select('*')
      //   .from('warehouses', 'w')
      //   .where('w.id = :warehouseId', {
      //     warehouseId,
      //   })
      //   .getRawOne();

      const warehouseBranches = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from('warehouse_branches', 'wb')
        .where('wb.warehouse_id = :warehouseId', {
          warehouseId,
        })
        .getRawMany();

      requestFrom = {
        id: Number(warehouseBranches[0].id),
        name: warehouseBranches[0].name,
      };

      pickupLocation = {
        id: Number(warehouseBranches[0].id),
        warehouse_id: Number(warehouseId),
        name: warehouseBranches[0].name,
        phone: warehouseBranches[0].phone,
        email: warehouseBranches[0].email,
        address: warehouseBranches[0].address,
        contact_person_name: warehouseBranches[0].contact_person_name,
        contact_person_email: warehouseBranches[0].contact_person_email,
        postal_code: warehouseBranches[0].postal_code,
        latitude: Number(warehouseBranches[0].latitude),
        longitude: Number(warehouseBranches[0].longitude),
        address_type: 'pickup',
      };

      // pickupLocation = await this.userAddressBookRepository.findOne({
      //   where: { id: order.warehouse_id },
      // });
    } else {
      const customerId = order.customer_id;
      const customer = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from('customers', 'p')
        .where('p.id = :customerId', {
          customerId,
        })
        .getRawOne();

      requestFrom = {
        id: customer.id,
        name: customer.first_name + ' ' + customer.last_name,
      };

      const pickupLocationRaw = await this.userAddressBookRepository.findOne({
        where: { id: order.pickup_address_id },
      });

      if (pickupLocationRaw) {
        const { id, first_name, last_name, phone_number_1, ...rest } =
          pickupLocationRaw;

        pickupLocation = {
          id: id,
          name: first_name + ' ' + last_name,
          phone: phone_number_1,
          ...rest,
        };
      }
    }

    const dropOffLocationRaw = await this.userAddressBookRepository.findOne({
      where: { id: order.shipping_address_id },
    });

    if (dropOffLocationRaw) {
      const { id, first_name, last_name, phone_number_1, ...rest } =
        dropOffLocationRaw;

      dropOffLocation = {
        id: id,
        name: first_name + ' ' + last_name,
        phone: phone_number_1,
        ...rest,
      };
    }

    const delivery = await this.deliveriesRepository.findOne({
      where: { order_id: payment?.order_id },
    });
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    return {
      orderId: payment.order_id,
      stripeId: payment.stripe_id,
      deliveryId: delivery.id.toString(),
      // targetedVehicleTypeId: delivery.vehicle_type_id.toString(),
      requestFrom,
      pickupLocation,
      dropOffLocation,
      totalDistance: delivery.init_distance.toString(),
      totalWeight: '2', // NEED TO REWORK THIS
      deliveryCost: delivery.delivery_charge,
      estimatedArrivalTime: '250', // NEED TO REWORK THIS
      status: ShippingStatus.SEARCHING,
      orderType: order.order_type,
      assignedRider: null,
    };
  }

  async createDeliveryRequestFromStripeId(stripeId: string): Promise<any> {
    console.log('createDeliveryRequestFromStripeId called!');
    console.log('stripeId', stripeId);
    const payload = await this.getDeliveryRequestPayloadByStripeId(stripeId);
    return payload;
  }

  async create(
    createDeliveryRequestDto: CreateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    const createdDeliveryRequest = new this.deliveryRequestModel(
      createDeliveryRequestDto,
    );
    return createdDeliveryRequest.save();
  }

  async findAll(): Promise<DeliveryRequest[]> {
    return this.deliveryRequestModel.find().exec();
  }

  async findOne(id: string): Promise<DeliveryRequest> {
    return this.deliveryRequestModel.findById(id).exec();
  }

  async update(
    id: string,
    updateData: Partial<CreateDeliveryRequestDto>,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async updateStatus(
    id: string,
    status: ShippingStatus,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async updateAssignedRider(
    id: string,
    assignedRider: AssignedRider,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestModel
      .findByIdAndUpdate(id, { assignedRider }, { new: true })
      .exec();
  }

  async partialUpdate(
    id: string,
    updateData: UpdateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<DeliveryRequest> {
    return this.deliveryRequestModel.findByIdAndDelete(id).exec();
  }
}

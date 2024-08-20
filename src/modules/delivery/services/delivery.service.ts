import { Injectable } from '@nestjs/common';
import { LocationService } from '@modules/location/location.service';
import { EntityManager, Repository } from 'typeorm';

import { CreateDeliveryRequestDto } from '@modules/delivery/dtos/create-delivery-request.dto';
import { OrderType } from '@common/enums/order.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from '@modules/orders/entities/orders.entity';
import { UserAddressBook } from '@modules/user-address-book/user-address-book.entity';
import { Deliveries } from '../deliveries.entity';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { UpdateDeliveryRequestDto } from '../dtos/update-delivery-request.dto';
import {
  AssignedRider,
  DeliveryRequest,
} from '../schemas/delivery-request.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
    @InjectRepository(Deliveries)
    private deliveriesRepository: Repository<Deliveries>,
    private readonly entityManager: EntityManager,
    private locationService: LocationService,
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    @InjectRepository(UserAddressBook)
    private userAddressBookRepository: Repository<UserAddressBook>,
  ) {}

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

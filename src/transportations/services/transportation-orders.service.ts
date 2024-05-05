import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportationOrders } from '../entities/transportation-orders.entity';
import { CreateTransportationOrderDto } from '../dtos/create-transportation-order.dto';

@Injectable()
export class TransportationOrdersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(TransportationOrders)
    private readonly transportationOrdersRepository: Repository<TransportationOrders>,
  ) {}

  async create(
    createTransportationOrderDto: CreateTransportationOrderDto,
  ): Promise<TransportationOrders> {
    const customer_id = this.request['user'].id;
    const order = this.transportationOrdersRepository.create({
      customer_id,
      ...createTransportationOrderDto,
    });

    return this.transportationOrdersRepository.save(order);
  }
}

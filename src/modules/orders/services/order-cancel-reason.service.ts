import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderCancelReason } from '../entities/order-cancel-reason.entity';
import { CreateOrderCancelReasonDto } from '../dtos/create-order-cancel-reason.dto';
import { UpdateOrderCancelReasonDto } from '../dtos/update-order-cancel-reason.dto';

@Injectable()
export class OrderCancelReasonService {
  constructor(
    @InjectRepository(OrderCancelReason)
    private readonly orderCancelReasonRepository: Repository<OrderCancelReason>,
  ) {}

  async findAll(): Promise<OrderCancelReason[]> {
    return this.orderCancelReasonRepository.find();
  }

  async findById(id: number): Promise<OrderCancelReason> {
    const reason = await this.orderCancelReasonRepository.findOne({
      where: { id },
    });
    if (!reason) {
      throw new NotFoundException(
        `Order cancel reason with ID ${id} not found.`,
      );
    }
    return reason;
  }

  async create(
    createDto: CreateOrderCancelReasonDto,
  ): Promise<OrderCancelReason> {
    const newReason = this.orderCancelReasonRepository.create(createDto);
    return this.orderCancelReasonRepository.save(newReason);
  }

  async update(
    id: number,
    updateDto: UpdateOrderCancelReasonDto,
  ): Promise<OrderCancelReason> {
    const reason = await this.findById(id);
    const updatedReason = { ...reason, ...updateDto };
    return this.orderCancelReasonRepository.save(updatedReason);
  }

  async delete(id: number): Promise<void> {
    const reason = await this.findById(id);
    await this.orderCancelReasonRepository.remove(reason);
  }
}

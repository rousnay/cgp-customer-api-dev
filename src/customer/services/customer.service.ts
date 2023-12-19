import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private userRepository: Repository<Customer>,
  ) {}

  public async createUser(createUserDto: CreateCustomerDto): Promise<Customer> {
    return await this.userRepository.save(createUserDto);
  }

  public async getUsers(): Promise<Customer[]> {
    return await this.userRepository.find();
  }

  public async getUser(userId: number): Promise<Customer> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  public async editUser(
    userId: number,
    createUserDto: CreateCustomerDto,
  ): Promise<Customer> {
    const editedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!editedUser) {
      throw new NotFoundException('User not found');
    }
    const result = await this.userRepository.update(
      { id: userId },
      createUserDto,
    );
    console.log(result);
    return editedUser;
  }

  public async deleteUser(userId: number): Promise<void> {
    await this.userRepository.delete(userId);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../dtos/api-response.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  public async getCustomers({
    page = 1,
    limit = 10,
  }): Promise<ApiResponseDto<Customer[]>> {
    const offset = (page - 1) * limit;

    const customers = await this.customerRepository.find({
      skip: offset,
      take: limit,
    });

    return {
      message: 'Customers fetched successfully',
      status: 'success',
      data: customers,
    };
  }

  public async getCustomer(customerId: number): Promise<Customer> {
    return await this.customerRepository.findOne({
      where: { idNumber: customerId },
    });
  }

  public async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return await this.customerRepository.save(createCustomerDto);
  }

  public async editCustomer(
    customerId: number,
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    const editedCustomer = await this.customerRepository.findOne({
      where: { idNumber: customerId },
    });

    if (!editedCustomer) {
      throw new NotFoundException('Customer not found');
    }
    const result = await this.customerRepository.update(
      { idNumber: customerId },
      createCustomerDto,
    );
    console.log(result);
    return editedCustomer;
  }

  public async deleteCustomer(customerId: number): Promise<void> {
    await this.customerRepository.delete(customerId);
  }
}

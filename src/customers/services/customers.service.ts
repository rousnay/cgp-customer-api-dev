import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { Customers } from '../entities/customers.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customers)
    private customerRepository: Repository<Customers>,
  ) {}

  public async getCustomers({
    page = 1,
    limit = 10,
    ...filters
  }): Promise<ApiResponseDto<Customers[]>> {
    const offset = (page - 1) * limit;

    const customers = await this.customerRepository.find({
      where: filters,
      skip: offset,
      take: limit,
    });

    const totalCount = await this.customerRepository.count();

    return {
      message: 'Customers fetched successfully',
      status: 'success',
      totalCount,
      currentPage: page,
      currentLimit: limit,
      data: customers,
    };
  }

  public async getCustomer(customerId: number): Promise<Customers> {
    return await this.customerRepository.findOne({
      where: { id: customerId },
    });
  }

  public async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customers> {
    return await this.customerRepository.save(createCustomerDto);
  }

  public async editCustomer(
    customerId: number,
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customers> {
    const editedCustomer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!editedCustomer) {
      throw new NotFoundException('Customer not found');
    }
    const result = await this.customerRepository.update(
      { id: customerId },
      createCustomerDto,
    );
    console.log(result);
    return editedCustomer;
  }

  public async deleteCustomer(customerId: number): Promise<void> {
    await this.customerRepository.delete(customerId);
  }

  // public async getTotalCustomerCount(): Promise<number> {
  //   return await this.customerRepository.count();
  // }
}

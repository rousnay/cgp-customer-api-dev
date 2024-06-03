import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, Like, EntityManager } from 'typeorm';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { Customers } from '../entities/customers.entity';
import { Preferences } from '../../application/entities/preferences.entity';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private jwtService: JwtService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Customers)
    private customersRepository: Repository<Customers>,
    @InjectRepository(Preferences)
    private readonly preferencesRepository: Repository<Preferences>,
  ) {}

  public async getCustomers({
    page = 1,
    limit = 10,
    ...filters
  }): Promise<ApiResponseDto<Customers[]>> {
    const offset = (page - 1) * limit;

    const customers = await this.customersRepository.find({
      where: filters,
      skip: offset,
      take: limit,
    });

    const totalCount = await this.customersRepository.count();

    return {
      message: 'Customers fetched successfully',
      status: 'success',
      totalCount,
      currentPage: page,
      currentLimit: limit,
      data: customers,
    };
  }

  public async getLoggedInCustomerProfile(): Promise<{ data: Customers }> {
    try {
      const customer = this.request['user'];
      return {
        data: customer,
      };
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  public async editCustomerProfile(
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<{ data: any }> {
    const customerId = this.request['user'].id;
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Update the rider's profile directly in the database
    await this.customersRepository.update(
      { id: customerId },
      updateCustomerDto,
    );

    // Fetch the updated rider profile
    const updatedCustomer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    return {
      data: updatedCustomer,
    };
  }

  public async getCustomer(customerId: number): Promise<{ data: Customers }> {
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    return {
      data: customer,
    };
  }

  async getCustomerPreferences(customerId: number): Promise<number[]> {
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
      relations: ['preferences'],
    });

    if (!customer) {
      return null;
    }
    return customer.preferences.map((preference) => preference.id);
  }

  async setCustomerPreferences(
    customer: Customers,
    preferenceIds: number[],
  ): Promise<void> {
    const preferences = await Promise.all(
      preferenceIds.map(async (id) => {
        const preference = await this.preferencesRepository.findOne({
          where: { id },
        }); // Pass an object with 'where' clause
        if (!preference) {
          throw new Error(`Preference with id ${id} not found`);
        }
        return preference;
      }),
    );

    customer.preferences = preferences;
    await this.customersRepository.save(customer);
  }

  async updateCustomerPreferences(
    customer: Customers,
    preferenceIds: number[],
  ): Promise<void> {
    // Fetch the Preference entities based on the provided preferenceIds
    const preferences = await Promise.all(
      preferenceIds.map(async (id) => {
        const preference = await this.preferencesRepository.findOne({
          where: { id },
        });
        if (!preference) {
          throw new Error(`Preference with id ${id} not found`);
        }
        return preference;
      }),
    );

    // Assign the fetched Preferences to the customer's preferences property
    customer.preferences = preferences;
    // Save the updated customer entity
    await this.customersRepository.save(customer);
  }
}

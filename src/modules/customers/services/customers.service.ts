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
  ): Promise<{ data: Customers }> {
    const customerId = this.request['user'].id;
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const queryPartsForSQL = [];
    const parametersForSQL = [];

    // Update customer fields if they are truthy in updateCustomerDto
    if (updateCustomerDto.first_name) {
      customer.first_name = updateCustomerDto.first_name;

      queryPartsForSQL.push('first_name = ?');
      parametersForSQL.push(updateCustomerDto.first_name);
    }
    if (updateCustomerDto.last_name) {
      customer.last_name = updateCustomerDto.last_name;

      queryPartsForSQL.push('last_name = ?');
      parametersForSQL.push(updateCustomerDto.last_name);
    }
    if (updateCustomerDto.phone) {
      customer.phone = updateCustomerDto.phone;

      queryPartsForSQL.push('phone = ?');
      parametersForSQL.push(updateCustomerDto.phone);
    }
    if (updateCustomerDto.email) {
      customer.email = updateCustomerDto.email;

      queryPartsForSQL.push('email = ?');
      parametersForSQL.push(updateCustomerDto.email);
    }
    if (updateCustomerDto.date_of_birth) {
      customer.date_of_birth = updateCustomerDto.date_of_birth;
    }
    if (updateCustomerDto.gender) {
      customer.gender = updateCustomerDto.gender;
    }
    if (updateCustomerDto.is_active !== undefined) {
      customer.is_active = updateCustomerDto.is_active;
    }

    // Save the updated customer
    await this.customersRepository.save(customer);

    // Update the users table based on the changes made to the customers table

    // const query = `
    //   UPDATE users
    //   SET first_name = ?, last_name = ?, email = ?, phone = ?
    //   WHERE id = ?
    // `;

    if (queryPartsForSQL.length !== 0) {
      const queryForSQL = `
      UPDATE users
      SET ${queryPartsForSQL.join(', ')}
      WHERE id = ?
    `;
      parametersForSQL.push(customer.user_id);

      await this.entityManager.query(queryForSQL, parametersForSQL);
    }

    // await this.customersRepository.update(
    //   { id: customerId },
    //   updateCustomerDto,
    // );

    const editedCustomer = await this.customersRepository.findOne({
      where: { id: customerId },
    });
    return { data: editedCustomer };
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

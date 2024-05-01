import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerAddressBook } from '../entities/customer-address-book.entity';
import { CreateCustomerAddressDto } from '../dtos/create-customer-address.dto';

@Injectable()
export class CustomerAddressBookService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(CustomerAddressBook)
    private readonly addressBookRepository: Repository<CustomerAddressBook>,
  ) {}

  async createAddress(
    createAddressDto: CreateCustomerAddressDto,
  ): Promise<CustomerAddressBook> {
    // Create a new address entity
    const address = this.addressBookRepository.create({
      ...createAddressDto,
      customer_id: this.request['user'].id, // Set the customer_id
    });

    // Save the address to the database
    return await this.addressBookRepository.save(address);
  }

  async getAllAddresses(): Promise<CustomerAddressBook[]> {
    return await this.addressBookRepository
      .find
      //   {
      //   where: { customer_id: this.request['user'].id },
      // }
      ();
  }

  async getAddressesByType(type: any): Promise<CustomerAddressBook[]> {
    return await this.addressBookRepository.find({
      where: {
        // customer_id: this.request['user'].id,
        address_type: type,
      },
    });
  }

  async getAddressById(id: number): Promise<CustomerAddressBook> {
    return await this.addressBookRepository.findOne({
      where: {
        // customer_id: this.request['user'].id,
        id: id,
      },
    });
  }
}

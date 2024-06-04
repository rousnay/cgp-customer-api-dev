import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { AddressType, UserAddressBook } from './user-address-book.entity';
import { CreateUserAddressDto } from './create-user-address.dto';
import { UpdateUserAddressDto } from './update-user-address.dto';

@Injectable()
export class UserAddressBookService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(UserAddressBook)
    private readonly addressBookRepository: Repository<UserAddressBook>,
  ) {}

  async createAddress(
    createAddressDto: CreateUserAddressDto,
  ): Promise<UserAddressBook> {
    // Create a new address entity
    const customer_id = this.request['user'].id;

    if (
      createAddressDto.address_type &&
      !Object.values(AddressType).includes(createAddressDto.address_type)
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Invalid address type. Must be one of: shipping, billing, pickup',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const address = await this.addressBookRepository.save({
      ...createAddressDto,
      customer_id,
    });

    if (address?.is_default === true) {
      await this.addressBookRepository.update(
        {
          customer_id,
          address_type: address?.address_type,
          id: Not(address?.id), // Exclude the current address
        },
        { is_default: false },
      );
    }

    return address;
  }

  async getAllAddresses(): Promise<UserAddressBook[]> {
    return await this.addressBookRepository.find({
      where: { customer_id: this.request['user'].id },
    });
  }

  async getAddressesByType(type: any): Promise<UserAddressBook[]> {
    return await this.addressBookRepository.find({
      where: {
        customer_id: this.request['user'].id,
        address_type: type,
      },
    });
  }

  async getAddressById(id: number): Promise<UserAddressBook> {
    return await this.addressBookRepository.findOne({
      where: {
        customer_id: this.request['user'].id,
        id: id,
      },
    });
  }

  async updateAddressById(
    id: number,
    updateAddressDto: UpdateUserAddressDto,
  ): Promise<UserAddressBook> {
    const customer_id = this.request['user'].id;

    if (
      updateAddressDto.address_type &&
      !Object.values(AddressType).includes(updateAddressDto.address_type)
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Invalid address type. Must be one of: shipping, billing, pickup',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const address = await this.addressBookRepository.findOne({
      where: { id, customer_id },
    });

    if (!address) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Address not found',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedAddress = await this.addressBookRepository.save({
      ...address,
      ...updateAddressDto,
    });

    if (updatedAddress?.is_default === true) {
      await this.addressBookRepository.update(
        {
          customer_id,
          address_type: updatedAddress?.address_type,
          id: Not(updatedAddress?.id), // Exclude the current address
        },
        { is_default: false },
      );
    }

    return updatedAddress;
  }

  async setDefaultAddressById(id: number): Promise<UserAddressBook> {
    const customer_id = this.request['user'].id;

    const address = await this.addressBookRepository.findOne({
      where: { id, customer_id },
    });

    if (!address) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Address not found',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Update all addresses of the customer to set is_default to false
    await this.addressBookRepository.update(
      {
        customer_id,
        address_type: address.address_type,
      },
      { is_default: false },
    );

    // Set the selected address as default
    address.is_default = true;
    return this.addressBookRepository.save(address);
  }
}

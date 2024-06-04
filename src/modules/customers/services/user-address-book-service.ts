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

import {
  AddressType,
  UserAddressBook,
} from '../entities/user-address-book.entity';
import { CreateUserAddressDto } from '../dtos/create-user-address.dto';

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
      // throw new Error(
      //   'Invalid address type. Must be one of: shipping, billing, pickup',
      // );
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

    const address = this.addressBookRepository.create({
      ...createAddressDto,
      customer_id,
    });

    // if (address.is_default === true) {
    //   // Find all other addresses of the same type for the customer
    //   const otherAddresses = await this.addressBookRepository.find({
    //     where: {
    //       customer_id,
    //       address_type: address.address_type,
    //       // id: Not(address.id), // Exclude the current address
    //     },
    //   });

    //   console.log('otherAddresses', otherAddresses);

    //   // Update all other addresses of the same type to be not default
    //   if (otherAddresses.length > 0) {
    //     const afterUpdate = await this.addressBookRepository.update(
    //       {
    //         customer_id,
    //         address_type: address.address_type,
    //         id: Not(address.id), // Exclude the current address
    //       },
    //       { is_default: false },
    //     );

    //     console.log('afterUpdate', afterUpdate);
    //   }
    // }

    // Save the address to the database
    return await this.addressBookRepository.save(address);
  }

  async getAllAddresses(): Promise<UserAddressBook[]> {
    return await this.addressBookRepository
      .find
      //   {
      //   where: { customer_id: this.request['user'].id },
      // }
      ();
  }

  async getAddressesByType(type: any): Promise<UserAddressBook[]> {
    return await this.addressBookRepository.find({
      where: {
        // customer_id: this.request['user'].id,
        address_type: type,
      },
    });
  }

  async getAddressById(id: number): Promise<UserAddressBook> {
    return await this.addressBookRepository.findOne({
      where: {
        // customer_id: this.request['user'].id,
        id: id,
      },
    });
  }
}

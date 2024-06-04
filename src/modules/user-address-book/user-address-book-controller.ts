import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { UserAddressBook } from './user-address-book.entity';
import { CreateUserAddressDto } from './create-user-address.dto';
import { UserAddressBookService } from './user-address-book-service';

@ApiTags("Customer's Address Book")
@Controller('customers-addresses')
export class UserAddressBookController {
  constructor(private readonly addressBookService: UserAddressBookService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create new address' })
  async createAddress(@Body() createAddressDto: CreateUserAddressDto): Promise<{
    status: string;
    message: string;
    data: UserAddressBook;
  }> {
    const result = await this.addressBookService.createAddress(
      createAddressDto,
    );
    return {
      status: 'success',
      message: 'Address created successfully',
      data: result,
    };
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiQuery({
    name: 'type',
    type: String,
    required: false,
    description: 'Type of address (optional)',
    enum: ['shipping', 'billing', 'pickup'],
  })
  async getAddresses(@Query('type') type?: string): Promise<{
    status: string;
    message: string;
    data: UserAddressBook[];
  }> {
    if (type) {
      const results = await this.addressBookService.getAddressesByType(type);
      return {
        status: 'success',
        message: 'Address fetched successfully',
        data: results,
      };
    } else {
      const results = await this.addressBookService.getAllAddresses();
      return {
        status: 'success',
        message: 'Address fetched successfully',
        data: results,
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get address by id' })
  async getAddressById(@Param('id') id: number): Promise<{
    status: string;
    message: string;
    data: UserAddressBook;
  }> {
    const address = await this.addressBookService.getAddressById(id);
    if (!address) {
      throw new NotFoundException('Address with given id is not found');
    }
    return {
      status: 'success',
      message: 'Address fetched successfully',
      data: address,
    };
  }
}

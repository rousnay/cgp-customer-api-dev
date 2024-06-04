import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
  Put,
  ParseIntPipe,
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
import { UpdateUserAddressDto } from './update-user-address.dto';

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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update an address by id' })
  async updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateUserAddressDto,
  ): Promise<{ status: string; message: string; data: UserAddressBook }> {
    const result = await this.addressBookService.updateAddressById(
      id,
      updateAddressDto,
    );
    return {
      status: 'success',
      message: 'The Address has been updated successfully',
      data: result,
    };
  }

  @Put('set-default/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Set an address as default by id' })
  async setDefaultAddress(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: string; message: string; data: UserAddressBook }> {
    const result = await this.addressBookService.setDefaultAddressById(id);
    return {
      status: 'success',
      message: 'The address has been set as default successfully',
      data: result,
    };
  }
}

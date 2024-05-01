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
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerAddressBook } from '../entities/customer-address-book.entity';
import { CustomerAddressBookService } from '../services/customer-address-book-service';
import { CreateCustomerAddressDto } from '../dtos/create-customer-address.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('customers-addresses')
@ApiTags('Customers')
export class CustomerAddressBookController {
  constructor(
    private readonly addressBookService: CustomerAddressBookService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create new address' })
  async createAddress(
    @Body() createAddressDto: CreateCustomerAddressDto,
  ): Promise<CustomerAddressBook> {
    return await this.addressBookService.createAddress(createAddressDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiQuery({ name: 'type', type: String, required: false })
  async getAddresses(
    @Query('type') type?: string,
  ): Promise<CustomerAddressBook[]> {
    if (type) {
      return await this.addressBookService.getAddressesByType(type);
    } else {
      return await this.addressBookService.getAllAddresses();
    }
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get address by id' })
  async getAddressById(@Param('id') id: number): Promise<CustomerAddressBook> {
    const address = await this.addressBookService.getAddressById(id);
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }
}

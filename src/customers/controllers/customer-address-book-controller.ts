import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
  ValidationPipe,
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
  ): Promise<{
    status: string;
    message: string;
    data: CustomerAddressBook;
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

  @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access_token')
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
    data: CustomerAddressBook[];
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
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get address by id' })
  async getAddressById(@Param('id') id: number): Promise<{
    status: string;
    message: string;
    data: CustomerAddressBook;
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

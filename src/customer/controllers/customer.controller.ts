import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Customer } from '../entities/customer.entity';
import { ApiBody, ApiConsumes, ApiTags, ApiQuery } from '@nestjs/swagger';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get('all')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  public async getCustomers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<Customer[]> {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const customers = await this.customerService.getCustomers({
      page: parsedPage,
      limit: parsedLimit,
    });

    return customers;
  }

  @Get('/:customerId')
  public async getCustomer(@Param('customerId') customerId: number) {
    return await this.customerService.getCustomer(customerId);
  }

  @Post('create')
  public async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @Patch('/edit/:customerId')
  public async editCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @Param('customerId') customerId: number,
  ): Promise<Customer> {
    return await this.customerService.editCustomer(
      customerId,
      createCustomerDto,
    );
  }

  @Delete('/delete/:customerId')
  public async deleteCustomer(@Param('customerId') customerId: number) {
    return await this.customerService.deleteCustomer(customerId);
  }
}

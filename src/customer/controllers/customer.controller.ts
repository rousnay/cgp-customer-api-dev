import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Customer } from '../entities/customer.entity';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post('create')
  public async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @Get('all')
  public async getCustomers(): Promise<Customer[]> {
    return await this.customerService.getCustomers();
  }

  @Get('/:customerId')
  public async getCustomer(@Param('customerId') customerId: number) {
    return await this.customerService.getCustomer(customerId);
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

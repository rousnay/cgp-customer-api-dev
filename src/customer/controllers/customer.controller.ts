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

@Controller('user')
export class UserController {
  constructor(private userService: CustomerService) {}

  @Post('create')
  public async createUser(
    @Body() createUserDto: CreateCustomerDto,
  ): Promise<Customer> {
    return await this.userService.createUser(createUserDto);
  }

  @Get('all')
  public async getUsers(): Promise<Customer[]> {
    return await this.userService.getUsers();
  }

  @Get('/:userId')
  public async getUser(@Param('userId') userId: number) {
    return await this.userService.getUser(userId);
  }

  @Patch('/edit/:userId')
  public async editUser(
    @Body() createUserDto: CreateCustomerDto,
    @Param('userId') userId: number,
  ): Promise<Customer> {
    return await this.userService.editUser(userId, createUserDto);
  }

  @Delete('/delete/:userId')
  public async deleteUser(@Param('userId') userId: number) {
    return await this.userService.deleteUser(userId);
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Customer } from '../entities/customer.entity';
import {
  ApiHeader,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { CustomerQueryParamsPipe } from '../customer-query-params.pipe';
import { CustomerQueryParamsDto } from '../dtos/customer-query-params.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

// @ApiHeader({
//   name: 'X-MyHeader',
//   description: 'Custom header',
// })
@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  // Get all customers ++++++++++++++++++++++++++++++++++++
  @Get('all')
  @ApiOperation({
    summary: 'Get all customers',
    // description: 'Returns an example response',
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    // type: ApiResponseDto,
    content: {
      'application/json': {
        // schema: {
        //   type: 'object',
        //   properties: {
        //     message: { type: 'string', example: 'This is an example message' },
        //     data: {
        //       type: 'object',
        //       properties: {
        //         id: { type: 'number', example: 1 },
        //         name: { type: 'string', example: 'John Doe' },
        //       },
        //     },
        //   },
        // },
        example: {
          message: 'Customers fetched successfully',
          status: 'success',
          data: [
            {
              id: 1,
              sosVoterId: '2119833852',
              idNumber: 4336257,
              voterStatus: 'A',
              partyCode: ' ',
              firstName: 'ATIF',
              middleName: 'ATIQ',
              lastName: 'ABBASI',
              sex: 'M',
              birthDate: '1973',
              streetName: 'FOREST',
              streetNumber: '9302',
              streetType: 'LN',
              city: 'DALLAS',
              zipCode: '75243',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new CustomerQueryParamsPipe())
  public async getCustomers(
    @Query() queryParams: CustomerQueryParamsDto,
  ): Promise<ApiResponseDto<Customer[]>> {
    const customers = await this.customerService.getCustomers({
      ...queryParams,
    });

    return customers;
  }

  // Get a customer by ID ++++++++++++++++++++++++++++++++++
  @Get('/:customerId')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'customerId', type: Number })
  @ApiResponse({ status: 200, type: Customer })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async getCustomer(@Param('customerId') customerId: number) {
    return await this.customerService.getCustomer(customerId);
  }

  // Create a new customer ++++++++++++++++++++++++++++++++
  @Post('create')
  @ApiOperation({
    summary: 'Create a new customer',
    // description: 'Returns an example response',
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: 201,
    type: Customer,
    description: 'The created customer',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'This is an example message' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'John Doe' },
              },
            },
          },
        },
        example: {
          message: 'This is an example message',
          data: {
            sosVoterId: 'ABC123',
            idNumber: 12345,
            voterStatus: 'Active',
            partyCode: 'XYZ',
            firstName: 'John',
            middleName: 'M',
            lastName: 'Doe',
            sex: 'Male',
            birthDate: '1990-01-01',
            streetName: 'Main Street',
            streetNumber: '123',
            streetType: 'Ave',
            city: 'Cityville',
            zipCode: '12345',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return await this.customerService.createCustomer(createCustomerDto);
  }

  // Edit a customer by ID ++++++++++++++++++++++++++++++++
  @Patch('/edit/:customerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer by ID' })
  @ApiParam({ name: 'customerId', type: Number })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({ status: 200, type: Customer })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async editCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @Param('customerId') customerId: number,
  ): Promise<Customer> {
    return await this.customerService.editCustomer(
      customerId,
      createCustomerDto,
    );
  }

  // Delete a customer by ID +++++++++++++++++++++++++++++
  @Delete('/delete/:customerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete customer by ID' })
  @ApiParam({ name: 'customerId', type: Number })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async deleteCustomer(@Param('customerId') customerId: number) {
    return await this.customerService.deleteCustomer(customerId);
  }
}

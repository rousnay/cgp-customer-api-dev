import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UsePipes,
  UseGuards,
  NotFoundException,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CustomersService } from '../services/customers.service';

import { Customers } from '../entities/customers.entity';
import { CustomerQueryParamsPipe } from '../customers-query-params.pipe';
import { ApiResponseDto } from '../dtos/api-response.dto';
// import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { CustomersQueryParamsDto } from '../dtos/customers-query-params.dto';
import { CustomerPreferencesDto } from '../dtos/customer-preferences.dto';
import { UpdateCustomerPreferencesDto } from '../dtos/update-customer-preferences.dto';

// @ApiHeader({
//   name: 'X-MyHeader',
//   description: 'Custom header',
// })
@Controller('customers')
@ApiTags('Customers')
export class CustomerController {
  constructor(private customersService: CustomersService) {}

  // Get all customers ++++++++++++++++++++++++++++++++++++
  @Get('all')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access_token')
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
          totalCount: 1,
          currentPage: 1,
          currentLimit: 10,
          data: [
            {
              id: 3,
              user_id: 44,
              first_name: 'Mozahidur',
              last_name: 'Rahman',
              phone: '01711111111',
              email: 'rousnay@revinr.com',
              date_of_birth: null,
              gender: null,
              profile_image_url: null,
              registration_date: '2024-04-21T11:47:24.000Z',
              last_login: '2024-04-21T05:47:42.541Z',
              is_active: true,
              created_at: '2024-04-21T05:47:42.541Z',
              updated_at: '2024-04-21T05:47:42.541Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new CustomerQueryParamsPipe())
  public async getCustomers(
    @Query() queryParams: CustomersQueryParamsDto,
  ): Promise<ApiResponseDto<Customers[]>> {
    const customers = await this.customersService.getCustomers({
      ...queryParams,
    });

    return customers;
  }

  // Get logged in customer profile +++++++++++++++++++++++++++++++++
  @Get('profile')
  @ApiOperation({ summary: 'Get logged in customer profile' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async getCustomerProfile(): Promise<{
    message: string;
    status: string;
    data: Customers;
  }> {
    try {
      const result = await this.customersService.getLoggedInCustomerProfile();
      return {
        status: 'success',
        message: 'Logged in customer profile has been fetched successfully',
        ...result,
      };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Edit a customer profile ++++++++++++++++++++++++++++++++
  @Patch('/profile/edit/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiBody({ type: UpdateCustomerDto })
  @UseInterceptors(
    FileInterceptor('profile_image', {
      storage: diskStorage({
        destination: '/tmp', // Destination folder for uploaded files
        filename: (req, file, callback) => {
          const originalName = file.originalname;
          const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
          const time = new Date().toLocaleTimeString('en-US', {
            hour12: false,
          }); // Current time in HH:MM:SS format
          const formattedTime = time.replace(/:/g, '-'); // Replacing colons with underscores for HH_MM_SS
          const randomNumber = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number

          const fileNameParts = [
            originalName.replace(/\.[^/.]+$/, ''), // File name without extension
            date,
            formattedTime,
            randomNumber.toString(),
          ];

          const finalFileName =
            fileNameParts.join('_') + extname(file.originalname); // Join parts with underscores
          return callback(null, finalFileName);
        },
      }),
    }),
  )
  @ApiResponse({ status: 200, type: Customers })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async editCustomerProfile(
    @UploadedFile() profile_image: Express.Multer.File,
    @Body() formData: UpdateCustomerDto, // Use FormDataPipe
  ): Promise<{ message: string; status: string; data: Customers }> {
    const updateCustomerDto = new UpdateCustomerDto();
    updateCustomerDto.first_name = formData.first_name;
    updateCustomerDto.last_name = formData.last_name;
    updateCustomerDto.phone = formData.phone;
    updateCustomerDto.email = formData.email;
    updateCustomerDto.date_of_birth = formData.date_of_birth;
    updateCustomerDto.gender = formData.gender;
    updateCustomerDto.is_active = formData.is_active;

    if (profile_image) {
      console.log(profile_image);
      const filePath = profile_image.path; // Path to the uploaded file
      console.log(filePath);
    }

    const result = await this.customersService.editCustomerProfile(
      updateCustomerDto,
    );

    return {
      status: 'success',
      message: 'Customer updated successfully',
      ...result,
    };
  }

  // Get a customer by ID ++++++++++++++++++++++++++++++++++
  @Get('/:customerId')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'customerId', type: Number })
  @ApiResponse({ status: 200, type: Customers })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async getCustomer(
    @Param('customerId') customerId: number,
  ): Promise<{ message: string; status: string; data: Customers }> {
    const result = await this.customersService.getCustomer(customerId);
    return {
      status: 'success',
      message: 'Customer fetched successfully',
      ...result,
    };
  }

  @Get(':customerId/preferences')
  async getCustomerPreferences(
    @Param('customerId') customerId: number,
  ): Promise<number[]> {
    const preferences = await this.customersService.getCustomerPreferences(
      customerId,
    );
    if (!preferences) {
      throw new NotFoundException(
        `Preferences for customer with id ${customerId} not found`,
      );
    }
    return preferences;
  }

  @Post(':customerId/preferences')
  async setCustomerPreferences(
    @Param('customerId') customerId: number,
    @Body() customerPreferencesDto: CustomerPreferencesDto,
  ): Promise<void> {
    const customer = await this.customersService.getCustomer(customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }

    await this.customersService.setCustomerPreferences(
      customer.data,
      customerPreferencesDto.preferences,
    );
  }

  @Put(':customerId/preferences')
  async updateCustomerPreferences(
    @Param('customerId') customerId: number,
    @Body() updatePreferencesDto: UpdateCustomerPreferencesDto,
  ): Promise<void> {
    const customer = await this.customersService.getCustomer(customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }

    await this.customersService.updateCustomerPreferences(
      customer.data,
      updatePreferencesDto.preferences,
    );
  }
}

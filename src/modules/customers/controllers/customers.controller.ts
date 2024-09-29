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
  Delete,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { profileImageInterceptor } from '@core/interceptors/file-interceptor';
import { CloudflareMediaService } from '@services/cloudflare-media-upload.service';

import { ApiResponseDto } from '../dtos/api-response.dto';
import { CustomerQueryParamsPipe } from '../customers-query-params.pipe';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { CustomersQueryParamsDto } from '../dtos/customers-query-params.dto';
import { CustomerPreferencesDto } from '../dtos/customer-preferences.dto';
import { UpdateCustomerPreferencesDto } from '../dtos/update-customer-preferences.dto';
import { CustomersService } from '../services/customers.service';
import { Customers } from '../entities/customers.entity';

// @ApiHeader({
//   name: 'X-MyHeader',
//   description: 'Custom header',
// })
@Controller('customers')
@ApiTags('Customers')
export class CustomerController {
  constructor(
    private customersService: CustomersService,
    private cloudflareMediaService: CloudflareMediaService,
  ) {}

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
  // @UseInterceptors(profileImageInterceptor)
  @UseInterceptors(FileInterceptor('profile_image'))
  @ApiResponse({ status: 200, type: Customers })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async editCustomerProfile(
    @UploadedFile() profile_image: Express.Multer.File,
    @Body() formData: UpdateCustomerDto, // Use FormDataPipe
  ): Promise<{ message: string; status: string; data: Customers }> {
    let cf_media_id = null;
    let profile_image_url = null;

    console.log(profile_image);

    if (profile_image) {
      const result = await this.cloudflareMediaService.uploadMedia(
        profile_image,
        {
          model: 'Customer-ProfileImage',
          model_id: 88,
          image_type: 'thumbnail',
        },
      );
      cf_media_id = result?.data?.id;
      profile_image_url = result?.data?.media_url;
    }

    const updateCustomerDto = new UpdateCustomerDto();
    updateCustomerDto.first_name = formData.first_name;
    updateCustomerDto.last_name = formData.last_name;
    updateCustomerDto.phone = formData.phone;
    updateCustomerDto.email = formData.email;
    updateCustomerDto.date_of_birth = formData.date_of_birth;
    updateCustomerDto.gender = formData.gender;
    updateCustomerDto.profile_image_cf_media_id = cf_media_id;

    const result = await this.customersService.editCustomerProfile(
      updateCustomerDto,
    );
    result.data.profile_image_url = profile_image_url;

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

  @Delete('/remove-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Remove logged in customer',
  })
  @ApiResponse({ status: 200, description: 'Customer removed successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeCustomer(): Promise<any> {
    try {
      const result = await this.customersService.removeCustomer();

      return {
        status: 'success',
        message: 'Customer removed successfully',
        ...result,
      };
    } catch (error) {
      // Handle specific error cases
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Customer not found');
      } else if (error instanceof ConflictException) {
        throw new ConflictException('Customer already deleted');
      }

      // Log or handle other types of errors
      throw new InternalServerErrorException(
        'An error occurred while removing the customer',
      );
    }
  }

  @Post('/restore-account')
  @ApiOperation({
    summary: 'Restore a deleted customer by email and user_type',
  })
  @ApiQuery({
    name: 'email',
    description: 'Email of the customer to restore',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Customer restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted customer not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async restoreCustomerByEmailAndUserType(
    @Query('email') email: string,
  ): Promise<{ status: string; message: string }> {
    try {
      const result = await this.customersService.restoreCustomer(email);

      return {
        status: 'success',
        message: 'Customer restored successfully',
        ...result,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Deleted customer not found');
      }
      throw new InternalServerErrorException(
        'An error occurred while restoring the customer',
      );
    }
  }
}

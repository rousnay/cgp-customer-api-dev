import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, Like, EntityManager } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Preferences } from '@modules/application/entities/preferences.entity';

import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { Customers } from '../entities/customers.entity';
import { AppConstants } from '@common/constants/constants';
import { ConfigService } from '@config/config.service';
import { InjectModel } from '@nestjs/mongoose';
import { DeliveryRequest } from '@modules/delivery/schemas/delivery-request.schema';
import { Model } from 'mongoose';
import { PaymentMethodService } from '@modules/payments/services/payment-method.service';
import { UserDeleted } from '../entities/user-deleted.entity';
import { UserType } from '@common/enums/user.enum';

@Injectable()
export class CustomersService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private jwtService: JwtService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Customers)
    private customersRepository: Repository<Customers>,
    @InjectRepository(UserDeleted)
    private deletedUsersRepository: Repository<UserDeleted>,
    @InjectRepository(Preferences)
    private readonly preferencesRepository: Repository<Preferences>,
    private paymentMethodService: PaymentMethodService,
    // @InjectModel(DeliveryRequest.name)
    // private deliveryRequestModel: Model<DeliveryRequest>,
    configService: ConfigService,
  ) {
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  public async getCustomers({
    page = 1,
    limit = 10,
    ...filters
  }): Promise<ApiResponseDto<Customers[]>> {
    const offset = (page - 1) * limit;

    const customers = await this.customersRepository.find({
      where: filters,
      skip: offset,
      take: limit,
    });

    const totalCount = await this.customersRepository.count();

    return {
      message: 'Customers fetched successfully',
      status: 'success',
      totalCount,
      currentPage: page,
      currentLimit: limit,
      data: customers,
    };
  }

  public async getLoggedInCustomerProfile(): Promise<{ data: Customers }> {
    try {
      const customer = this.request['user'];
      const defaultPaymentMethodInfo =
        await this.paymentMethodService.hasDefaultPaymentMethod();

      return {
        data: {
          ...customer,
          has_default_payment_method: defaultPaymentMethodInfo.data,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  public async editCustomerProfile(
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<{ data: any }> {
    const customerId = this.request['user'].id;
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Update the rider's profile directly in the database
    await this.customersRepository.update(
      { id: customerId },
      updateCustomerDto,
    );

    // Fetch the updated rider profile
    const updatedCustomer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    return {
      data: updatedCustomer,
    };
  }

  public async getCustomer(customerId: number): Promise<{ data: Customers }> {
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    return {
      data: customer,
    };
  }

  async getCustomerPreferences(customerId: number): Promise<number[]> {
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
      relations: ['preferences'],
    });

    if (!customer) {
      return null;
    }
    return customer.preferences.map((preference) => preference.id);
  }

  async setCustomerPreferences(
    customer: Customers,
    preferenceIds: number[],
  ): Promise<void> {
    const preferences = await Promise.all(
      preferenceIds.map(async (id) => {
        const preference = await this.preferencesRepository.findOne({
          where: { id },
        }); // Pass an object with 'where' clause
        if (!preference) {
          throw new Error(`Preference with id ${id} not found`);
        }
        return preference;
      }),
    );

    customer.preferences = preferences;
    await this.customersRepository.save(customer);
  }

  async updateCustomerPreferences(
    customer: Customers,
    preferenceIds: number[],
  ): Promise<void> {
    // Fetch the Preference entities based on the provided preferenceIds
    const preferences = await Promise.all(
      preferenceIds.map(async (id) => {
        const preference = await this.preferencesRepository.findOne({
          where: { id },
        });
        if (!preference) {
          throw new Error(`Preference with id ${id} not found`);
        }
        return preference;
      }),
    );

    // Assign the fetched Preferences to the customer's preferences property
    customer.preferences = preferences;
    // Save the updated customer entity
    await this.customersRepository.save(customer);
  }

  async getCustomerProfileImageUrl(
    profile_image_cf_media_id: any,
  ): Promise<any> {
    let url = null;

    if (profile_image_cf_media_id != null) {
      try {
        const cloudflare_id = await this.entityManager
          .createQueryBuilder()
          .select(['cf.cloudflare_id'])
          .from('cf_media', 'cf')
          .where('cf.id = :id', { id: profile_image_cf_media_id })
          .getRawOne();

        url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          cloudflare_id.cloudflare_id +
          '/' +
          this.cfMediaVariant;

        return url;
      } catch (e) {
        // do nothing
      }
    } else {
      return null;
    }
  }

  async getCustomerOngoingDelivery(customerId: any): Promise<{ data: any }> {
    let ongoing_delivery = null;
    // find deliver id and order id for find ongoing trip
    // const deliveriesData = await this.entityManager.query(
    //   `SELECT
    //     id, customer_id, order_id, shipping_status
    // FROM
    //     deliveries
    // WHERE
    //     shipping_status IN ('waiting', 'searching', 'accepted', 'reached_at_pickup_point', 'picked_up', 'reached_at_delivery_point')
    //     AND customer_id = ?`,
    //   [customerId],
    // );

    const deliveriesData = await this.entityManager.query(
      `
    SELECT
        d.id, d.customer_id, d.order_id, d.shipping_status
    FROM
        deliveries d
    INNER JOIN orders o ON d.order_id = o.id
    WHERE
        d.shipping_status IN ('waiting', 'searching', 'accepted', 'reached_at_pickup_point', 'picked_up', 'reached_at_delivery_point')
        AND d.customer_id = ?
        AND o.order_type = 'transportation_only'
    `,
      [customerId],
    );

    if (deliveriesData.length > 0) {
      ongoing_delivery = {
        order_id: deliveriesData[0].order_id || null,
        delivery_id: deliveriesData[0].id || null,
        shipping_status: deliveriesData[0].shipping_status || null,
      };
      return ongoing_delivery;
    } else {
      return null;
    }
  }

  // async getCustomerPaymentMethodInfo(customerId: any): Promise<{ data: any }> {
  //   const defaultPaymentMethodInfo =
  //     await this.paymentMethodService.hasDefaultPaymentMethod(user_id);
  //   return defaultPaymentMethodInfo;
  // }

  async removeCustomer(): Promise<any> {
    const userId = this.request['user'].user_id;
    // Find the customer
    const customer = await this.customersRepository.findOne({
      where: { user_id: userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with user_id ${userId} not found`);
    }

    if (customer.deleted_at) {
      throw new ConflictException('Customer already deleted');
    }

    // Query the users table directly using EntityManager
    const user = await this.entityManager.query(
      'SELECT * FROM users WHERE id = ?',
      [userId],
    );

    if (!user || user.length === 0) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Transfer data to deleted_users table
    const deletedUser = new UserDeleted();
    deletedUser.user_id = customer.user_id;
    deletedUser.first_name = customer.first_name;
    deletedUser.last_name = customer.last_name;
    deletedUser.phone = customer.phone;
    deletedUser.email = customer.email;
    deletedUser.password = user[0].password; // Get password from users table
    deletedUser.user_type = user[0].user_type; // Get user_type from users table
    deletedUser.date_of_birth = customer.date_of_birth;
    deletedUser.gender = customer.gender;
    deletedUser.profile_image_cf_media_id = customer.profile_image_cf_media_id;

    await this.deletedUsersRepository.save(deletedUser);

    // Nullify sensitive data in customers table
    customer.first_name = 'Removed';
    customer.last_name = 'Customer';
    customer.phone = '0000000000';
    customer.email = 'removed_user@tradebar.com.au';
    customer.date_of_birth = null;
    customer.gender = null;
    customer.is_active = false;
    customer.profile_image_cf_media_id = null;
    customer.deleted_at = new Date();
    await this.customersRepository.save(customer);

    // Nullify sensitive data in users table using EntityManager

    await this.entityManager.query(
      `UPDATE users
       SET name = 'Removed Customer', first_name = 'Removed', last_name = 'Customer', email = 'removed_customer@tradebar.com.au', phone = '0000000000', password = '', active = 0
       WHERE id = ?`,
      [userId],
    );

    console.log('Removed customer with user_id', userId);

    return {
      data: {
        user_id: userId,
      },
    };
  }

  async restoreCustomer(email: string): Promise<any> {
    // Retrieve data from deleted_users table by email and user_type
    const deletedUser = await this.deletedUsersRepository.findOne({
      where: { email, user_type: UserType.CUSTOMER },
    });

    if (!deletedUser) {
      throw new NotFoundException(
        `Deleted customer with email ${email} not found`,
      );
    }

    // Find the corresponding customer in the customers table
    const existingCustomer = await this.customersRepository.findOne({
      where: { user_id: deletedUser.user_id },
    });

    if (!existingCustomer) {
      throw new NotFoundException(
        `Customer with user_id ${deletedUser.user_id} not found`,
      );
    }

    // Restore customer data in the customers table by updating the existing entry
    existingCustomer.first_name = deletedUser.first_name;
    existingCustomer.last_name = deletedUser.last_name;
    existingCustomer.phone = deletedUser.phone;
    existingCustomer.email = deletedUser.email;
    existingCustomer.date_of_birth = deletedUser.date_of_birth;
    existingCustomer.gender = deletedUser.gender;
    existingCustomer.profile_image_cf_media_id =
      deletedUser.profile_image_cf_media_id;
    existingCustomer.is_active = true; // Make the customer active again
    existingCustomer.deleted_at = null;
    // existingCustomer.restored_at = new Date();

    await this.customersRepository.save(existingCustomer);

    // Restore data to users table using email and user_type
    await this.entityManager.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, email = ?, phone = ?, password = ?, active = 1
       WHERE id = ?`,
      [
        deletedUser.first_name,
        deletedUser.last_name,
        deletedUser.email,
        deletedUser.phone,
        deletedUser.password,
        deletedUser.user_id,
      ],
    );

    // Remove the entry from deleted_users table after successful restoration
    await this.deletedUsersRepository.delete({
      email,
      user_type: UserType.CUSTOMER,
    });

    console.log('Restored customer with email', email);

    return {
      data: {
        email: email,
      },
    };
  }
}

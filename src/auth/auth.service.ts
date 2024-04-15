import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { CreateCustomerDto } from 'src/customers/dtos/create-customer.dto';
import { Customers } from 'src/customers/entities/customers.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async registration(
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', password_confirmation);
      formData.append('user_type', 'customer');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to register the user
      const response = await axios.post(
        'https://cgp.studypress.org/api/v1/user/auth/register',
        formData,
        config,
      );

      if (response.status === 200 || response.status === 201) {
        // Registration successful
        const userData = response.data;

        // Create a new Customer entity based on the registration data
        const createCustomerDto: CreateCustomerDto = {
          user_id: userData.user_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          // Populate other fields as needed
        };

        // Create a new Customers entity
        const newCustomer = Customers.create({
          user_id: createCustomerDto.user_id,
          first_name: createCustomerDto.first_name,
          last_name: createCustomerDto.last_name,
          phone_number: createCustomerDto.phone_number,
          date_of_birth: createCustomerDto.date_of_birth,
          gender: createCustomerDto.gender,
          profile_image_url: createCustomerDto.profile_image_url,
          registration_date: createCustomerDto.registration_date,
          last_login: createCustomerDto.last_login,
          is_active: createCustomerDto.is_active,
        });

        // Save the new Customer entity to the database
        const savedCustomer = await newCustomer.save();

        // Return the registration data along with the newly created Customer entity
        return {
          registrationData: userData,
          newCustomer: savedCustomer,
        };
      } else {
        // Unexpected response format
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async login(
    identity: string,
    password: string,
    // user_type: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('identity', identity);
      formData.append('password', password);
      formData.append('user_type', 'customer');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        'https://cgp.studypress.org/api/v1/user/auth/login',
        formData,
        config,
      );

      // Assuming Laravel returns the authenticated user data
      if (response.status === 200 || response.status === 201) {
        // Success response
        return response.data;
      } else {
        // Unexpected response format
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getOTP(session_id: string, otp: string): Promise<any> {
    try {
      // Generate OTP logic here (e.g., using a library like speakeasy or generating a random number)

      const formData = new FormData();
      formData.append('session_id', session_id);
      formData.append('otp', otp);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        'https://cgp.studypress.org/api/v1/user/auth/verify-login-otp',
        formData,
        config,
      );

      if (response.status === 200 || response.status === 201) {
        // Success response
        if (response?.data?.data?.auth_token) {
          const payload = { username: session_id, sub: otp };

          return {
            msg: response?.data?.data?.msg,
            user: response?.data?.data?.user,
            access_token: this.jwtService.sign(payload),
            //   auth_token: response?.data?.data?.auth_token,
          };
        } else {
          // Unexpected response format
          throw new Error('Unexpected response format');
        }
      } else {
        // Unexpected response format
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        // console.error('Error registering user:', error);
        console.error('Error generating OTP:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}

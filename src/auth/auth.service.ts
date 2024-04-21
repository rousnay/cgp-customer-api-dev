import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { CreateCustomerDto } from 'src/customers/dtos/create-customer.dto';
import { Customers } from 'src/customers/entities/customers.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async registration(
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    // password_confirmation: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('email', email);
      formData.append('phone', phone);
      // formData.append('password_confirmation', password_confirmation);
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

      // Success response
      return {
        status: 'success',
        message: response?.data?.msg,
        data: response?.data?.data,
      };
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

  async verifyEmailWithOTP(session_id: string, otp: string): Promise<any> {
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
        'https://cgp.studypress.org/api/v1/user/auth/validate-otp',
        formData,
        config,
      );
      // return response?.data;
      if (response.status === 200 || response.status === 201) {
        // Success response
        return {
          status: 'success',
          message: 'OTP verified successfully',
          data: { session_id: session_id, otp: otp },
        };
      } else {
        return response.data;
        // Unexpected response format
        // throw new Error('Unexpected response format');
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
  async resetPassword(
    session_id: string,
    otp: string,
    password: string,
    password_confirmation: string,
    // user_type: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('session_id', session_id);
      formData.append('otp', otp);
      formData.append('password', password);
      formData.append('password_confirmation', password_confirmation);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        'https://cgp.studypress.org/api/v1/user/auth/reset-password',
        formData,
        config,
      );

      // Assuming Laravel returns the authenticated user data
      if (response.status === 200 || response.status === 201) {
        // Success response
        return {
          status: 'success',
          message: response?.data?.msg,
          data: response?.data?.data,
        };
      } else {
        return response.data;
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
      // Success response
      return {
        status: 'success',
        message: response?.data?.msg,
        data: response?.data?.data,
      };
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

  async verifyLoginWithOTP(session_id: string, otp: string): Promise<any> {
    try {
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

      // return response?.data;
      if (response.status === 200 || response.status === 201) {
        // Success response
        if (response?.data?.data?.auth_token) {
          const payload = { username: session_id, sub: otp };
          return {
            status: 'success',
            message: response?.data?.msg,
            data: {
              user: response?.data?.data?.user,
              access_token: this.jwtService.sign(payload),
              //   auth_token: response?.data?.data?.auth_token,
            },
          };
        } else {
          return response?.data;
          // Unexpected response format
          // throw new Error('Unexpected response format');
        }
      } else {
        return response.data;
        // Unexpected response format
        // throw new Error('Unexpected response format');
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

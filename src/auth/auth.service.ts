import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async registration(
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    user_type: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', password_confirmation);
      formData.append('user_type', user_type);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        'https://cgp.studypress.org/api/v1/user/auth/register',
        formData,
        config,
      );

      // Assuming Laravel returns the authenticated user data
      return response.data;
    } catch (error) {
      // Handle error
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  async login(
    identity: string,
    password: string,
    user_type: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('identity', identity);
      formData.append('password', password);
      formData.append('user_type', user_type);

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
      return response.data;
    } catch (error) {
      // Handle error
      console.error('Error authenticating user:', error);
      throw error;
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

      if (response.data.data.auth_token) {
        const payload = { username: session_id, sub: otp };

        return {
          msg: response?.data?.data?.msg,
          user: response?.data?.data?.user,
          access_token: this.jwtService.sign(payload),
          //   auth_token: response?.data?.data?.auth_token,
        };
      }

      // Assuming Laravel returns the authenticated user data
      //   return response.data;
    } catch (error) {
      console.error('Error generating OTP:', error);
      throw error;
    }
  }
}

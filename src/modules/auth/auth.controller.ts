import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('registration')
  @ApiOperation({ summary: 'Customer registration' })
  @ApiBody({
    description: 'Customer registration data',
    examples: {
      credentials: {
        summary: 'Example of valid registration data',
        value: {
          first_name: 'Mozahidur',
          last_name: 'Rahman',
          email: 'rousnay@revinr.com',
          phone: '01711111111',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'All data related to home page',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message:
            'An OTP has been sent to your email inbox. Please use this OTP to verify your email address.',
          data: {
            session_id: 'sczwivkttybvvikhe3b56haxdcjpwr2q4',
          },
        },
      },
    },
  })
  async registration(
    @Body()
    data: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    },
  ) {
    return this.authService.registration(
      data.first_name,
      data.last_name,
      data.email,
      data.phone,
    );
  }

  @Post('email-verification')
  @ApiOperation({ summary: 'Verify email address with OTP' })
  @ApiBody({
    description: 'Verify email address with OTP',
    examples: {
      credentials: {
        summary: 'Example of valid data',
        value: {
          session_id: 'r4m17y4p1vpaens2zj86lscguxqhxynvf',
          otp: '567809',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'All data related to home page',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message: 'OTP verified successfully',
          data: {
            session_id: 'ac1kjd8oiscdzsejzn839khbjedtruzfy',
            customer: {
              user_id: 43,
              first_name: 'Mozahidur',
              last_name: 'Rahman',
              phone: '01711111111',
              email: 'rousnay@revinr.com',
              registration_date: '2024-04-21T11:32:48.000Z',
              date_of_birth: null,
              gender: null,
              profile_image_url: null,
              created_at: '2024-04-21T05:33:17.743Z',
              updated_at: '2024-04-21T05:33:17.743Z',
              id: 2,
              last_login: '2024-04-21T05:33:17.743Z',
              is_active: true,
            },
          },
        },
      },
    },
  })
  async verifyEmailWithOTP(@Body() data: { session_id: string; otp: string }) {
    return this.authService.verifyEmailWithOTP(data.session_id, data.otp);
  }

  @Post('set-password')
  @ApiOperation({ summary: 'Set user password' })
  @ApiBody({
    description: 'User credentials to set password',
    examples: {
      credentials: {
        summary: 'Example of valid data',
        value: {
          session_id: 'r4m17y4p1vpaens2zj86lscguxqhxynvf',
          password: '12345678',
          password_confirmation: '12345678',
          device_token: 'df345nngf8dfgu',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'All data related to set password',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message:
            'Login password updated successfully. Please use updated password to login',
          data: {
            customer: {
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
            access_token:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YmJiYzlmOS0zZWVhLTQ3NzUtYTY1Zi01NzkzZDY1ZDEzYzMiLCJqdGkiOiI3NTJiOWMwNzcwZWRiZmQ2OWY4Mjg1NWZhZmM3NGYyODA1ZDUyY2IxYmQ0ZmRmNmQzN2NhYTUwOWJmNGQzZmJiZDI4YTEwN2M3YjY3MzBhMCIsImlhdCI6MTcxMzQzNTQ4Ni44MTgzNDEsIm5iZiI6MTcxMzQzNTQ4Ni44MTgzNDUsImV4cCI6MTc0NDk3MTQ4Ni44MTYyMjQsInN1YiI6IjI2Iiwic2NvcGVzIjpbXX0.rmNNicKItoHmzHL-uzgyaMvbITUcXygjQkqbtNREWSHLuY2kjlL_7nz8j_mBAh9TUaVdK2tB_LxpRTKUZ5RKx7wzOfIzXlmIkz9AuXfgaeEh97jp1Jv0Vi1aIZLJJdnThuRUQg_JEYobFz6iX7d8TwBJDLXJI5GnZnSn39DoAPsdlQ7D1zvLSIGdCJE-tzZcOORne0G-wuGUYr97dmEo0OQZQYMgFaRYarWoC6LxCnBoc1K-2oOwblUp-O4fPrSefSbH7paqMaxElo0LZ13LOVPg93OpctFftGK9vuPprvAIuGXXfahbdyseaII9RaumzW4IUf2z9AhoqoGsAMgkeHLaaYMzJKIt9PEdbBZVUi_ByvTA-KrfF4cXz_kZ0veDQ7MEWzF8p0SfwPnqGwAawAe9Dcu2eSQUbw63-3H3ot3twZgZwp0h7FVcYH9Q-VO1G7cvjUQkvVAy7qXEgIEShgobYGQjbBAum-E-NEiH1V0lLm4BGtH31jSaltUl-rIQ3wUCDCHD4p4pofMnCou-cZ4C865BR0O4dvGzi-IFKkDccLnWCU_30JPvAnyMYIpdaf6R3rN_SlBz9bv8IncbsuEOUcHVFkvlMWIOawrfF3dnwAoQMk724EB7LJxKN-oi2FcqBbIH_96aZTQaSzVPJ5kkxyw5RLya9P6RAY9WrZk',
          },
        },
      },
    },
  })
  async setPassword(
    @Body()
    credentials: {
      session_id: string;
      password: string;
      password_confirmation: string;
      device_token: string;
    },
  ) {
    return this.authService.setPassword(
      credentials.session_id,
      credentials.password,
      credentials.password_confirmation,
      credentials.device_token,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Customer login' })
  @ApiBody({
    description: 'Customer login credentials',
    examples: {
      credentials: {
        summary: 'Example of valid login credentials',
        value: {
          identity: 'rousnay@revinr.com',
          password: '12345678',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'All data related to home page',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message:
            'An OTP has been sent to your email inbox. Please use this OTP to login.',
          data: {
            session_id: 'm2oqt4mzsyqzvbdrrk9tzr22dkfsu6lzd',
          },
        },
      },
    },
  })
  async login(
    @Body()
    credentials: {
      identity: string;
      password: string;
    },
  ) {
    return this.authService.login(credentials.identity, credentials.password);
  }

  @Post('login-verification')
  @ApiOperation({ summary: 'Verify login data with OTP' })
  @ApiBody({
    description: 'Verify login data with OTP',
    examples: {
      credentials: {
        summary: 'Example of valid data',
        value: {
          session_id: 'r4m17y4p1vpaens2zj86lscguxqhxynvf',
          otp: '567809',
          device_token: 'df345nngf8dfgu',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'All data related to home page',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message: 'User authenticated successfully',
          data: {
            customer: {
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
            access_token:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YmJiYzlmOS0zZWVhLTQ3NzUtYTY1Zi01NzkzZDY1ZDEzYzMiLCJqdGkiOiI3NTJiOWMwNzcwZWRiZmQ2OWY4Mjg1NWZhZmM3NGYyODA1ZDUyY2IxYmQ0ZmRmNmQzN2NhYTUwOWJmNGQzZmJiZDI4YTEwN2M3YjY3MzBhMCIsImlhdCI6MTcxMzQzNTQ4Ni44MTgzNDEsIm5iZiI6MTcxMzQzNTQ4Ni44MTgzNDUsImV4cCI6MTc0NDk3MTQ4Ni44MTYyMjQsInN1YiI6IjI2Iiwic2NvcGVzIjpbXX0.rmNNicKItoHmzHL-uzgyaMvbITUcXygjQkqbtNREWSHLuY2kjlL_7nz8j_mBAh9TUaVdK2tB_LxpRTKUZ5RKx7wzOfIzXlmIkz9AuXfgaeEh97jp1Jv0Vi1aIZLJJdnThuRUQg_JEYobFz6iX7d8TwBJDLXJI5GnZnSn39DoAPsdlQ7D1zvLSIGdCJE-tzZcOORne0G-wuGUYr97dmEo0OQZQYMgFaRYarWoC6LxCnBoc1K-2oOwblUp-O4fPrSefSbH7paqMaxElo0LZ13LOVPg93OpctFftGK9vuPprvAIuGXXfahbdyseaII9RaumzW4IUf2z9AhoqoGsAMgkeHLaaYMzJKIt9PEdbBZVUi_ByvTA-KrfF4cXz_kZ0veDQ7MEWzF8p0SfwPnqGwAawAe9Dcu2eSQUbw63-3H3ot3twZgZwp0h7FVcYH9Q-VO1G7cvjUQkvVAy7qXEgIEShgobYGQjbBAum-E-NEiH1V0lLm4BGtH31jSaltUl-rIQ3wUCDCHD4p4pofMnCou-cZ4C865BR0O4dvGzi-IFKkDccLnWCU_30JPvAnyMYIpdaf6R3rN_SlBz9bv8IncbsuEOUcHVFkvlMWIOawrfF3dnwAoQMk724EB7LJxKN-oi2FcqBbIH_96aZTQaSzVPJ5kkxyw5RLya9P6RAY9WrZk',
          },
        },
      },
    },
  })
  async verifyLoginWithOTP(
    @Body() data: { session_id: string; otp: string; device_token: string },
  ) {
    return this.authService.verifyLoginWithOTP(
      data.session_id,
      data.otp,
      data.device_token,
    );
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Forget password' })
  @ApiBody({
    description: 'Customer registration data',
    examples: {
      credentials: {
        summary: 'Example of valid data',
        value: {
          identity: 'rousnay@revinr.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'All data related to forget password',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message:
            'An OTP has been sent to your email inbox. Please use this OTP to reset your password.',
          data: {
            session_id: 'sczwivkttybvvikhe3b56haxdcjpwr2q4',
          },
        },
      },
    },
  })
  async forgetPassword(
    @Body()
    data: {
      identity: string;
    },
  ) {
    return this.authService.forgetPassword(data.identity);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({
    description: 'User credentials to reset password',
    examples: {
      credentials: {
        summary: 'Example of valid data',
        value: {
          session_id: 'r4m17y4p1vpaens2zj86lscguxqhxynvf',
          otp: '33456',
          password: '12345678',
          password_confirmation: '12345678',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'All data related to home page',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message:
            'Login password updated successfully. Please use updated password to login',
          data: {
            customer: {
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
          },
        },
      },
    },
  })
  async resetPassword(
    @Body()
    credentials: {
      session_id: string;
      otp: string;
      password: string;
      password_confirmation: string;
    },
  ) {
    return this.authService.resetPassword(
      credentials.session_id,
      credentials.otp,
      credentials.password,
      credentials.password_confirmation,
    );
  }

  @Post('resent-otp')
  @ApiOperation({ summary: 'Resent OTP' })
  @ApiBody({
    description: 'Resent OTP data',
    examples: {
      credentials: {
        summary: 'Example of valid data',
        value: {
          session_id: 'sczwivkttybvvikhe3b56haxdcjpwr2q4',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'All data related to resent OTP',
    content: {
      'application/json': {
        example: {
          status: 'success',
          message: 'A new OTP is sent to registered email inbox.',
          data: {
            session_id: 'sczwivkttybvvikhe3b56haxdcjpwr2q4',
          },
        },
      },
    },
  })
  async resentOTP(
    @Body()
    data: {
      session_id: string;
    },
  ) {
    return this.authService.resentOTP(data.session_id);
  }

  @Get('customer')
  @ApiOperation({ summary: '**Testing purpose only**' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async getProfile(@Req() request: Request) {
    // The authenticated user can be accessed from the request object
    // console.log(request['user']);
    return request['user'];
  }
}

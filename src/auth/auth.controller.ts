import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
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
            otp: '245611',
            user: {
              id: 43,
              name: 'Mozahidur Rahman',
              first_name: 'Mozahidur',
              last_name: 'Rahman',
              email: 'rousnay@revinr.com',
              phone: '01711111111',
              email_verified_at: null,
              active: 1,
              user_type: 'customer',
              role_id: null,
              created_at: '2024-04-21T11:32:48.000000Z',
              updated_at: '2024-04-21T11:32:48.000000Z',
            },
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
            user: {
              id: 44,
              name: 'Mozahidur Rahman',
              first_name: 'Mozahidur',
              last_name: 'Rahman',
              email: 'rousnay@revinr.com',
              phone: '01711111111',
              email_verified_at: null,
              active: 1,
              user_type: 'customer',
              role_id: null,
              created_at: '2024-04-21T11:47:24.000000Z',
              updated_at: '2024-04-21T11:48:00.000000Z',
            },
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
            user: {
              id: 44,
              name: 'Mozahidur Rahman',
              first_name: 'Mozahidur',
              last_name: 'Rahman',
              email: 'rousnay@revinr.com',
              phone: '01711111111',
              email_verified_at: null,
              active: 1,
              user_type: 'customer',
              role_id: null,
              created_at: '2024-04-21T11:47:24.000000Z',
              updated_at: '2024-04-21T11:48:00.000000Z',
            },
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
  async verifyLoginWithOTP(@Body() data: { session_id: string; otp: string }) {
    return this.authService.verifyLoginWithOTP(data.session_id, data.otp);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @Get('user')
  async getAuthenticatedUser(@Req() req: Request): Promise<any> {
    try {
      const authorizationHeader = req.headers['authorization'];
      console.log(authorizationHeader);
      const user = await this.authService.getLoggedInUserInfo(
        authorizationHeader,
      );
      return {
        message: 'Login user data fetched successfully',
        status: 'success',
        ...user,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  @Get('id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async getUserIdFromToken(): Promise<number> {
    try {
      return await this.authService.getLoggedInUserId();
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }
}

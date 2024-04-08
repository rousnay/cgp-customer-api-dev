import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  @ApiOperation({ summary: 'User Registration' })
  @ApiBody({
    description: 'User Registration data',
    examples: {
      credentials: {
        summary: 'Example of valid registration data',
        value: {
          name: 'Mozahidur Rahman',
          email: 'rousnay@revinr.com',
          password: '12345678',
          password_confirmation: '12345678',
          user_type: 'customer',
        },
      },
    },
  })
  async registration(
    @Body()
    data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      user_type: string;
    },
  ) {
    return this.authService.registration(
      data.name,
      data.email,
      data.password,
      data.password_confirmation,
      data.user_type,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({
    description: 'User login credentials',
    examples: {
      credentials: {
        summary: 'Example of valid login credentials',
        value: {
          identity: 'rousnay@revinr.com',
          password: '12345678',
          user_type: 'customer',
        },
      },
    },
  })
  async login(
    @Body()
    credentials: {
      identity: string;
      password: string;
      user_type: string;
    },
  ) {
    return this.authService.login(
      credentials.identity,
      credentials.password,
      credentials.user_type,
    );
  }

  @Post('otp')
  @ApiOperation({ summary: 'OTP' })
  @ApiBody({
    description: 'Verify OTP',
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
  async getOTP(@Body() data: { session_id: string; otp: string }) {
    return this.authService.getOTP(data.session_id, data.otp);
  }
}

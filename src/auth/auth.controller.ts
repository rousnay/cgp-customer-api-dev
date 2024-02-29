import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
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

@Controller('Auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // @UseGuards(AuthGuard('local'))
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({
    description: 'User login credentials',
    examples: {
      credentials: {
        summary: 'Example of valid login credentials',
        value: {
          username: 'rousnay',
          password: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    // type: Customer,
    description: 'Logged in successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'This is an example message' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'number', example: 1 },
                username: { type: 'string', example: 'john_doe' },
              },
            },
          },
        },
        example: {
          access_token: 'eyJhbG....',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req) {
    // return req.user;
    return this.authService.login(req.user);
  }
}

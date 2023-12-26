import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
@ApiTags('Login')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @UseGuards(AuthGuard('local'))
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({
    description: 'User login credentials',
    examples: {
      credentials: {
        summary: 'Example of valid login credentials',
        value: {
          username: 'john_doe',
          password: 'my_password',
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
        example: { userId: 1, username: 'john' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req) {
    return req.user;
  }
}

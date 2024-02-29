import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersCreateDTO } from './users.create.dto';
import { Users } from './users.entity';
import {
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
@ApiTags('User')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  public async getUsers(): Promise<Users[]> {
    return await this.userService.getUsers();
  }

  @Get('/:username')
  public async getUser(@Param('username') username: string) {
    return await this.userService.getUser(username);
  }

  @Post('create')
  public async createUser(
    @Body() UsersCreateDTO: UsersCreateDTO,
  ): Promise<Users> {
    return await this.userService.createUser(UsersCreateDTO);
  }

  @Patch('/edit/:userId')
  public async editUser(
    @Body() UsersCreateDTO: UsersCreateDTO,
    @Param('userId') userId: number,
  ): Promise<Users> {
    return await this.userService.editUser(userId, UsersCreateDTO);
  }

  @Delete('/delete/:userId')
  public async deleteUser(@Param('userId') userId: number) {
    return await this.userService.deleteUser(userId);
  }
}

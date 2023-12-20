import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './user.entity';
import { ApiBody, ApiConsumes, ApiTags, ApiQuery } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  public async getUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  @Get('/:userId')
  public async getUser(@Param('userId') userId: number) {
    return await this.userService.getUser(userId);
  }

  @Post('create')
  public async createUser(@Body() createUserDto: CreateUserDTO): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  @Patch('/edit/:userId')
  public async editUser(
    @Body() createUserDto: CreateUserDTO,
    @Param('userId') userId: number,
  ): Promise<User> {
    return await this.userService.editUser(userId, createUserDto);
  }

  @Delete('/delete/:userId')
  public async deleteUser(@Param('userId') userId: number) {
    return await this.userService.deleteUser(userId);
  }
}

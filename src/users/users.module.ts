import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { PasswordService } from '../auth/password.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [UsersService, PasswordService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

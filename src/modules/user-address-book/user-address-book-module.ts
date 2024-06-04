import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule, HttpService } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@config/config.module';
import { UserAddressBook } from './user-address-book.entity';
import { UserAddressBookService } from './user-address-book-service';
import { UserAddressBookController } from './user-address-book-controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([UserAddressBook]),
  ],
  exports: [UserAddressBookService],
  providers: [UserAddressBookService],
  controllers: [UserAddressBookController],
})
export class UserAddressBookModule {}

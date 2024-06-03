import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        // host: configService.get('MYSQL_HOST'),
        host: configService.mysqlHost,
        // port: configService.mysqlPort,
        username: configService.mysqlUsername,
        password: configService.mysqlPassword,
        database: configService.mysqlDatabase,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true,
        ssl: false,
        // ssl: {
        //   rejectUnauthorized: true,
        // },
        // logging: ['query', 'error', 'schema', 'warn', 'info', 'log', 'migration'],
      }),
    }),
  ],
})
export class MysqlModule {}

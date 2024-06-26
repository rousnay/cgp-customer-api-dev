import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
// import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';

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
        extra: {
          connectionLimit: 10, // Use connection pooling
          keepAliveInitialDelay: 10000, // Adjust the initial delay
        },
        logging: [
          // 'query',
          'error',
          // 'schema',
          'warn',
          // 'info',
          'log',
          // 'migration',
        ],
      }),
    }),
  ],
})
export class MysqlModule {}

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { configSwagger } from '@config/swagger.config';
import { LoggerFactory } from '@config/winston.config';
import { SentryFilter } from '@core/filters/sentry.filter';
import { CustomValidationPipe } from '@core/pipes/custom-validation.pipe';
import { SocketAdapter } from '@core/adapters/socket.adapter';
import { AppModule } from './app.module';
import { EntityManager } from 'typeorm';
// import { setEntityManager } from '@common/utils/variables';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    // cors: true,
    // logger: LoggerFactory('MyApp'),
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  // Use the custom validation pipe globally
  app.useGlobalPipes(new CustomValidationPipe());

  // use the custom socket adapter
  app.useWebSocketAdapter(new SocketAdapter(app));

  //Initialize EntityManager on Application Startup for variables.ts
  // const entityManager = app.get(EntityManager);
  // setEntityManager(entityManager);

  // Import the filter globally, capturing all exceptions on all routes
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  // Initialize Sentry by passing the DNS included in the .env
  if (process.env.NODE_ENV === 'staging') {
    Sentry.init({
      dsn: process.env.SENTRY_DNS,
    });
  }

  configSwagger(app);
  await app.listen(port);
}
bootstrap();

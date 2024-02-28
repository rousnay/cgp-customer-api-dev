import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
// import { CorsOptions } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors();

  // OR for more advanced options
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',

    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  //   const corsOptions: CorsOptions = {
  //   origin: '*',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   allowedHeaders: 'Content-Type,Authorization',
  //   credentials: true,
  // };
  // app.enableCors(corsOptions);

  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();

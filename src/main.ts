import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
// import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.enableCors();
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',

    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  configSwagger(app);
  // Enable validation globally
  // app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
}
bootstrap();
// export { bootstrap };
// export default bootstrap;

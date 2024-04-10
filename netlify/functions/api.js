import { NestFactory } from '@nestjs/core';
import { AppModule } from './../../src/app.module';
import { setupSwagger } from './../../src/config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const port = process.env.POST || 3000;
  const app = await NestFactory.create(AppModule);
  //   const app = (await NestFactory.create) < NestExpressApplication > AppModule;
  // app.enableCors();
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',

    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  setupSwagger(app);
  await app.listen(port);
}
// bootstrap();
export { bootstrap };

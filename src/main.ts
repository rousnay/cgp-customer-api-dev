import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const port = process.env.POST || 3000;
  const app = await NestFactory.create(AppModule);
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
bootstrap();

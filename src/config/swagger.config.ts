import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { AppConstants } from '@common/constants/constants';

export function configSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(AppConstants.app.name)
    .setDescription(AppConstants.app.description)
    .setVersion(AppConstants.app.version)
    // .addTag('The Documentation')
    // .addServer('http://localhost:3000/', 'Local environment')
    // .addServer('https://demography-api.vercel.app/', 'Staging')
    // .addBearerAuth()
    //
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access_token',
    )

    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui-standalone-preset.js',
    ],
  });
}

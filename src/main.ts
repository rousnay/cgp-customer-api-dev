import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
// core
// import { resolve } from 'path';
// import { writeFileSync, createWriteStream } from 'fs';
// import { get } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Demography API')
    .setDescription('OpenAPI Specification for Demography API build by Revinr')
    .setVersion('1.0')
    .addTag('The Documentation')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(3000);

  // get the swagger json file (if app is running in development mode)
  // if (process.env.NODE_ENV === 'development') {
  //   // write swagger ui files
  //   get(`${serverUrl}/swagger/swagger-ui-bundle.js`, function (response) {
  //     response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
  //     console.log(
  //       `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
  //     );
  //   });

  //   get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
  //     response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
  //     console.log(
  //       `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
  //     );
  //   });

  //   get(
  //     `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
  //     function (response) {
  //       response.pipe(
  //         createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
  //       );
  //       console.log(
  //         `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
  //       );
  //     },
  //   );

  //   get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
  //     response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
  //     console.log(
  //       `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
  //     );
  //   });
  // }
}
bootstrap();

// require('dotenv').config()
// const mysql = require('mysql2')
// // Create the connection to the database
// const connection = mysql.createConnection(process.env.DATABASE_URL)

// // simple query
// connection.query('show tables', function (err, results, fields) {
//   console.log(results) // results contains rows returned by server
//   console.log(fields) // fields contains extra metadata about results, if available
// })

// // Example with placeholders
// connection.query('select 1 from dual where ? = ?', [1, 1], function (err, results) {
//   console.log(results)
// })

// connection.end()

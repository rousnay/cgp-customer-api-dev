import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Demography API')
    .setDescription('OpenAPI Specification for Demography API build by Revinr')
    .setVersion('1.0')
    .addTag('The Documentation')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
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

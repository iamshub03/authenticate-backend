import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //ENABLE DTO VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Authenticate API Doc')
    .setDescription(
      'This API contains all the API endpoints along with there required parameters',
    )
    .setVersion('1.0')
    .addTag('')
    .addSecurity('bearerAuth', {
      type: 'apiKey',
      name: 'authorization',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/doc', app, document);

  app.use(
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionSuccessStatus: 204,
      credentials: true,
    }),
  );

  await app.listen(3010);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // with this we can validate the data sended in the request (like DTO)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // with this we can clean unnecesary data
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

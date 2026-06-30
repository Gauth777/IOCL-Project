import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  // Security Middleware
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: frontendUrl.includes(',') ? frontendUrl.split(',') : frontendUrl,
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Pipes & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger/OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('SRMConnect Backend API')
    .setDescription(
      'The API documentation for the SRMConnect backend foundation.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  logger.log(`===================================================`);
  logger.log(` Application is running on: http://localhost:${port}/api/v1`);
  logger.log(` Swagger documentation is at: http://localhost:${port}/docs`);
  logger.log(`===================================================`);
}
void bootstrap();

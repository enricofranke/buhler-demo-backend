import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: '',
    defaultVersion: 'v1',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Buhler Demo Backend API')
    .setDescription('API documentation for the Buhler Demo Backend application')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('app', 'Application endpoints')
    .addTag('auth', 'Authentication and authorization endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const configService = app.get(ConfigService);
  
  // CORS Configuration
  app.enableCors({
    origin: configService.get<string[]>('api.corsOrigin') || ['http://localhost:4200'],
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix(configService.get<string>('api.prefix') || 'api');

  const port = configService.get<number>('port') || 3000;
  const apiPrefix = configService.get<string>('api.prefix') || 'api';

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation is available at: http://localhost:${port}/${apiPrefix}/docs`);
  console.log(`🔧 API Base URL: http://localhost:${port}/${apiPrefix}`);
  await app.listen(port);
}

bootstrap();
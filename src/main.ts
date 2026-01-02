import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get<string[]>('cors.origin'),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('port') || 3000;

  // Escuchar en todas las interfaces para permitir conexiones externas
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on:`);
  console.log(`   - Local:    http://localhost:${port}/api`);
  console.log(`   - Network:  http://192.168.0.7:${port}/api`);
  console.log(`   - Android:  http://10.0.2.2:${port}/api`);
}
bootstrap();

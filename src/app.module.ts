import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { LawyersModule } from './lawyers/lawyers.module';
import { UploadModule } from './upload/upload.module';
import { envConfig } from '@/config/env.config';
import { User } from '@/users/entities/user.entity';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { Specialization } from '@/specializations/specialization.entity';

@Module({
  imports: [
    // Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),

    // TypeORM Module
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'victoraponte',
      password: process.env.DB_PASSWORD || 'Admin123.',
      database: process.env.DB_DATABASE || 'socio_legal',
      entities: [User, Client, Lawyer, Specialization],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_HOST?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    }),

    // Serve Static Files (para servir imágenes subidas)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature Modules
    AuthModule,
    SpecializationsModule,
    LawyersModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

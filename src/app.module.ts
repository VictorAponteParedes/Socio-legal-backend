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
import { CasesModule } from './cases/cases.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { envConfig } from '@/config/env.config';
import { User } from '@/users/entities/user.entity';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { Specialization } from '@/specializations/specialization.entity';
import { PasswordResetCode } from '@/auth/entities/password-reset-code.entity';
import { Case } from '@/cases/entities/case.entity';
import { CaseProposal } from '@/cases/entities/case-proposal.entity';

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
      entities: [User, Client, Lawyer, Specialization, PasswordResetCode, Case, CaseProposal],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_HOST?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    SpecializationsModule,
    LawyersModule,
    UploadModule,
    CasesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

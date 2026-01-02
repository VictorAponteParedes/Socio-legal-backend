import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './services/email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '@/users/entities/user.entity';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { PasswordResetCode } from './entities/password-reset-code.entity';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
                signOptions: { expiresIn: configService.get('jwt.expiresIn') },
            }),
        }),
        TypeOrmModule.forFeature([User, Client, Lawyer, PasswordResetCode]),
    ],
    controllers: [AuthController],
    providers: [AuthService, EmailService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }

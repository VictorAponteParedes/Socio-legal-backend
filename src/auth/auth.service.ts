import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { PasswordResetCode } from './entities/password-reset-code.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '@/common/constants/user.constants';
import { EmailService } from './services/email.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        @InjectRepository(Lawyer)
        private readonly lawyerRepository: Repository<Lawyer>,
        @InjectRepository(PasswordResetCode)
        private readonly passwordResetCodeRepository: Repository<PasswordResetCode>,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Verificar si el email ya existe
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('El correo ya está registrado');
        }

        // Validar license para abogados
        if (registerDto.role === UserRole.LAWYER) {
            if (!registerDto.license) {
                throw new BadRequestException('La matrícula es obligatoria para abogados');
            }

            // Verificar si la matrícula ya existe
            const existingLawyer = await this.lawyerRepository.findOne({
                where: { license: registerDto.license },
            });

            if (existingLawyer) {
                throw new ConflictException('La matrícula ya está registrada');
            }
        }

        // Crear usuario base
        const user = this.userRepository.create({
            name: registerDto.name,
            lastname: registerDto.lastname,
            email: registerDto.email,
            password: registerDto.password,
            role: registerDto.role,
        });

        const savedUser = await this.userRepository.save(user);

        // Crear perfil específico según el rol
        if (registerDto.role === UserRole.CLIENT) {
            const client = this.clientRepository.create({
                user_id: savedUser.id,
                user: savedUser,
            });
            await this.clientRepository.save(client);
        } else if (registerDto.role === UserRole.LAWYER) {
            const lawyer = this.lawyerRepository.create({
                user_id: savedUser.id,
                user: savedUser,
                license: registerDto.license!,
            });
            await this.lawyerRepository.save(lawyer);
        }

        // Generar token
        const token = this.generateToken(savedUser);

        // Retornar respuesta sin password
        const { password, ...userWithoutPassword } = savedUser;

        return {
            message: 'Usuario registrado exitosamente',
            user: userWithoutPassword,
            token,
        };
    }

    async login(loginDto: LoginDto) {
        // Buscar usuario con password
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
            select: ['id', 'email', 'password', 'name', 'lastname', 'role', 'status'],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Validar password
        const isPasswordValid = await user.validatePassword(loginDto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Si viene el fcmToken, lo actualizamos
        if (loginDto.fcmToken) {
            await this.userRepository.update(user.id, {
                fcmToken: loginDto.fcmToken
            });
        }

        // Generar token
        const token = this.generateToken(user);

        // Retornar sin password
        const { password, ...userWithoutPassword } = user;

        return {
            message: 'Login exitoso',
            user: userWithoutPassword,
            token,
        };
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return user;
    }

    private generateToken(user: User): string {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }

    // ========================
    // PASSWORD RESET METHODS
    // ========================

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.userRepository.findOne({
            where: { email: forgotPasswordDto.email },
        });

        if (!user) {
            // Por seguridad, no revelar si el email existe o no
            return {
                message: 'Si el correo existe, recibirás un código de verificación',
            };
        }

        // Generar código de 6 dígitos
        const code = this.generateResetCode();

        // Calcular fecha de expiración (15 minutos)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Guardar código en la base de datos
        const resetCode = this.passwordResetCodeRepository.create({
            userId: user.id,
            code,
            expiresAt,
            used: false,
        });

        await this.passwordResetCodeRepository.save(resetCode);

        // Enviar email con código
        await this.emailService.sendPasswordResetCode(
            user.email,
            code,
            user.name,
        );

        return {
            message: 'Si el correo existe, recibirás un código de verificación',
        };
    }

    async verifyCode(verifyCodeDto: VerifyCodeDto) {
        const user = await this.userRepository.findOne({
            where: { email: verifyCodeDto.email },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Buscar código válido (no usado y no expirado)
        const resetCode = await this.passwordResetCodeRepository.findOne({
            where: {
                userId: user.id,
                code: verifyCodeDto.code,
                used: false,
                expiresAt: MoreThan(new Date()),
            },
        });

        if (!resetCode) {
            throw new BadRequestException('Código inválido o expirado');
        }

        return {
            message: 'Código verificado correctamente',
            valid: true,
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.userRepository.findOne({
            where: { email: resetPasswordDto.email },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar código nuevamente
        const resetCode = await this.passwordResetCodeRepository.findOne({
            where: {
                userId: user.id,
                code: resetPasswordDto.code,
                used: false,
                expiresAt: MoreThan(new Date()),
            },
        });

        if (!resetCode) {
            throw new BadRequestException('Código inválido o expirado');
        }

        // Actualizar contraseña
        user.password = resetPasswordDto.newPassword;
        await this.userRepository.save(user);

        // Marcar código como usado
        resetCode.used = true;
        await this.passwordResetCodeRepository.save(resetCode);

        return {
            message: 'Contraseña actualizada exitosamente',
        };
    }

    private generateResetCode(): string {
        // Generar código numérico de 6 dígitos
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}

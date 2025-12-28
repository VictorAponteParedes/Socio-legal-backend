import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@/common/constants/user.constants';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        @InjectRepository(Lawyer)
        private readonly lawyerRepository: Repository<Lawyer>,
        private readonly jwtService: JwtService,
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
}

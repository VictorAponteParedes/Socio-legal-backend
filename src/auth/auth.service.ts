import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Client, Lawyer } from '../users/entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/constants/user.constants';

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
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('El correo ya está registrado');
        }

        // Validate license for lawyers
        if (registerDto.role === UserRole.LAWYER) {
            if (!registerDto.license) {
                throw new BadRequestException('La matrícula es obligatoria para abogados');
            }

            // Check if license is already used
            const existingLawyer = await this.lawyerRepository.findOne({
                where: { license: registerDto.license },
            });

            if (existingLawyer) {
                throw new ConflictException('La matrícula ya está registrada');
            }
        }

        // Create user based on role
        let newUser: User;

        if (registerDto.role === UserRole.CLIENT) {
            newUser = this.clientRepository.create({
                name: registerDto.name,
                lastname: registerDto.lastname,
                email: registerDto.email,
                password: registerDto.password,
                role: UserRole.CLIENT,
            });
            await this.clientRepository.save(newUser);
        } else {
            newUser = this.lawyerRepository.create({
                name: registerDto.name,
                lastname: registerDto.lastname,
                email: registerDto.email,
                password: registerDto.password,
                license: registerDto.license,
                role: UserRole.LAWYER,
            });
            await this.lawyerRepository.save(newUser);
        }

        // Generate JWT token
        const token = this.generateToken(newUser);

        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;

        return {
            message: 'Usuario registrado exitosamente',
            user: userWithoutPassword,
            token,
        };
    }

    async login(loginDto: LoginDto) {
        // Find user by email (include password for validation)
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
            select: ['id', 'email', 'password', 'name', 'lastname', 'role', 'status'],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Validate password
        const isPasswordValid = await user.validatePassword(loginDto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Generate JWT token
        const token = this.generateToken(user);

        // Remove password from response
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

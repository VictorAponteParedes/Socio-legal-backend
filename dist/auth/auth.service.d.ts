import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, Client, Lawyer } from '../users/entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/constants/user.constants';
export declare class AuthService {
    private readonly userRepository;
    private readonly clientRepository;
    private readonly lawyerRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, clientRepository: Repository<Client>, lawyerRepository: Repository<Lawyer>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            name: string;
            lastname: string;
            email: string;
            role: UserRole;
            status: import("../common/constants/user.constants").UserStatus;
            profilePicture?: string;
            phone?: string;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: {
            id: string;
            name: string;
            lastname: string;
            email: string;
            role: UserRole;
            status: import("../common/constants/user.constants").UserStatus;
            profilePicture?: string;
            phone?: string;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    validateUser(userId: string): Promise<User>;
    private generateToken;
}

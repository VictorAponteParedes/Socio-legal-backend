import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            name: string;
            lastname: string;
            email: string;
            role: import("../common/constants/user.constants").UserRole;
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
            role: import("../common/constants/user.constants").UserRole;
            status: import("../common/constants/user.constants").UserStatus;
            profilePicture?: string;
            phone?: string;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
}

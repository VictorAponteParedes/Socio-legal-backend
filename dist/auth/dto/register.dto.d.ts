import { UserRole } from '../../common/constants/user.constants';
export declare class RegisterDto {
    name: string;
    lastname: string;
    email: string;
    password: string;
    role: UserRole;
    license?: string;
}

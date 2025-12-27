import { UserRole, UserStatus } from '../../common/constants/user.constants';
export declare abstract class User {
    id: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    profilePicture?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    getFullName(): string;
}

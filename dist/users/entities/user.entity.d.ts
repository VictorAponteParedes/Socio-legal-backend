import { UserRole, UserStatus } from '@/common/constants/user.constants';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
export declare class User {
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
    client?: Client;
    lawyer?: Lawyer;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    getFullName(): string;
}

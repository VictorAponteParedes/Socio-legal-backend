import { User } from '@/users/entities/user.entity';
export declare class Client {
    id: string;
    user: User;
    user_id: string;
    address?: string;
    city?: string;
    country?: string;
    preferences?: string;
    createdAt: Date;
    updatedAt: Date;
}

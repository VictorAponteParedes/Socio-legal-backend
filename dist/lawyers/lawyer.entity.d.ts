import { User } from '@/users/entities/user.entity';
export declare class Lawyer {
    id: string;
    user: User;
    user_id: string;
    license: string;
    bio?: string;
    specializations?: string[];
    yearsOfExperience: number;
    rating: number;
    totalReviews: number;
    languages?: string[];
    isAvailable: boolean;
    officeAddress?: string;
    city?: string;
    country?: string;
    createdAt: Date;
    updatedAt: Date;
}

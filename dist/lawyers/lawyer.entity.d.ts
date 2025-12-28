import { User } from '@/users/entities/user.entity';
import { Specialization } from '@/specializations/specialization.entity';
export declare class Lawyer {
    id: string;
    user: User;
    user_id: string;
    license: string;
    bio?: string;
    specializations: Specialization[];
    yearsOfExperience: number;
    rating: number;
    totalReviews: number;
    languages?: string[];
    isAvailable: boolean;
    officeAddress?: string;
    city?: string;
    country?: string;
    profileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

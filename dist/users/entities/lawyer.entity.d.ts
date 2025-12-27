import { User } from './user.entity';
export declare class Lawyer extends User {
    license: string;
    bio?: string;
    specializations?: string[];
    yearsOfExperience?: number;
    rating?: number;
    totalReviews?: number;
    languages?: string;
    isAvailable?: boolean;
    officeAddress?: string;
    city?: string;
    country?: string;
}

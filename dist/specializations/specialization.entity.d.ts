import { Lawyer } from '@/lawyers/lawyer.entity';
export declare class Specialization {
    id: number;
    name: string;
    description?: string;
    lawyers: Lawyer[];
    createdAt: Date;
    updatedAt: Date;
}

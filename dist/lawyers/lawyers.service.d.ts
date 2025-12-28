import { Repository } from 'typeorm';
import { Lawyer } from './lawyer.entity';
import { User } from '@/users/entities/user.entity';
import { Specialization } from '@/specializations/specialization.entity';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
export declare class LawyersService {
    private readonly lawyerRepository;
    private readonly userRepository;
    private readonly specializationRepository;
    constructor(lawyerRepository: Repository<Lawyer>, userRepository: Repository<User>, specializationRepository: Repository<Specialization>);
    findAll(): Promise<Lawyer[]>;
    findOne(id: string): Promise<Lawyer>;
    getMyProfile(userId: string): Promise<Lawyer>;
    updateMyProfile(userId: string, updateDto: UpdateLawyerProfileDto): Promise<Lawyer>;
    completeProfile(userId: string, completeDto: CompleteProfileDto): Promise<Lawyer>;
    findBySpecialization(specializationId: number): Promise<Lawyer[]>;
    findByCity(city: string): Promise<Lawyer[]>;
    softDelete(userId: string): Promise<{
        message: string;
    }>;
    reactivate(userId: string): Promise<{
        message: string;
    }>;
    checkProfileCompletion(userId: string): Promise<{
        completed: boolean;
        missing: string[];
    }>;
}

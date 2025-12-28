import { LawyersService } from './lawyers.service';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
export declare class LawyersController {
    private readonly lawyersService;
    constructor(lawyersService: LawyersService);
    findAll(): Promise<import("./lawyer.entity").Lawyer[]>;
    findOne(id: string): Promise<import("./lawyer.entity").Lawyer>;
    findBySpecialization(id: number): Promise<import("./lawyer.entity").Lawyer[]>;
    findByCity(city: string): Promise<import("./lawyer.entity").Lawyer[]>;
    getMyProfile(user: any): Promise<import("./lawyer.entity").Lawyer>;
    checkProfileCompletion(user: any): Promise<{
        completed: boolean;
        missing: string[];
    }>;
    completeProfile(user: any, completeDto: CompleteProfileDto): Promise<import("./lawyer.entity").Lawyer>;
    updateMyProfile(user: any, updateDto: UpdateLawyerProfileDto): Promise<import("./lawyer.entity").Lawyer>;
    softDelete(user: any): Promise<{
        message: string;
    }>;
    reactivate(user: any): Promise<{
        message: string;
    }>;
}

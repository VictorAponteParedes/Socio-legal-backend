import { SpecializationsService } from './specializations.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
export declare class SpecializationsController {
    private readonly specializationsService;
    constructor(specializationsService: SpecializationsService);
    create(createDto: CreateSpecializationDto): Promise<import("./specialization.entity").Specialization>;
    findAll(): Promise<import("./specialization.entity").Specialization[]>;
    findOne(id: number): Promise<import("./specialization.entity").Specialization>;
    update(id: number, updateDto: UpdateSpecializationDto): Promise<import("./specialization.entity").Specialization>;
    remove(id: number): Promise<void>;
}

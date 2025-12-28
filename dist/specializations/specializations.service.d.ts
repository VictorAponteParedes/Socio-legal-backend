import { Repository } from 'typeorm';
import { Specialization } from './specialization.entity';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
export declare class SpecializationsService {
    private readonly specializationRepository;
    constructor(specializationRepository: Repository<Specialization>);
    create(createDto: CreateSpecializationDto): Promise<Specialization>;
    findAll(): Promise<Specialization[]>;
    findOne(id: number): Promise<Specialization>;
    update(id: number, updateDto: UpdateSpecializationDto): Promise<Specialization>;
    remove(id: number): Promise<void>;
}

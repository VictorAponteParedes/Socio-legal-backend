import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawyerService } from './lawyer-service.entity';
import { CreateLawyerServiceDto } from './dto/create-lawyer-service.dto';
import { UpdateLawyerServiceDto } from './dto/update-lawyer-service.dto';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Injectable()
export class LawyerServicesService {
    constructor(
        @InjectRepository(LawyerService)
        private readonly lawyerServiceRepository: Repository<LawyerService>,
        @InjectRepository(Lawyer)
        private readonly lawyerRepository: Repository<Lawyer>,
    ) { }

    async create(createDto: CreateLawyerServiceDto, userId: string) {
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
        });

        if (!lawyer) {
            throw new NotFoundException('Lawyer profile not found for this user');
        }

        const service = this.lawyerServiceRepository.create({
            ...createDto,
            lawyer: lawyer,
        });

        return this.lawyerServiceRepository.save(service);
    }

    // Find all services for a specific lawyer (Public use)
    async findAllByLawyer(lawyerId: string) {
        return this.lawyerServiceRepository.find({
            where: { lawyer: { id: lawyerId }, isActive: true },
        });
    }

    // Find my services (Lawyer use - includes inactive)
    async findMine(userId: string) {
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
        });
        if (!lawyer) {
            throw new NotFoundException('Lawyer profile not found');
        }

        return this.lawyerServiceRepository.find({
            where: { lawyer: { id: lawyer.id } },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        const service = await this.lawyerServiceRepository.findOne({
            where: { id },
            relations: ['lawyer'],
        });
        if (!service) {
            throw new NotFoundException(`Service #${id} not found`);
        }
        return service;
    }

    async update(id: string, updateDto: UpdateLawyerServiceDto, userId: string) {
        const service = await this.findOne(id);
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
        });

        if (!lawyer || service.lawyer.id !== lawyer.id) {
            throw new ForbiddenException('You can only update your own services');
        }

        Object.assign(service, updateDto);
        return this.lawyerServiceRepository.save(service);
    }

    async remove(id: string, userId: string) {
        const service = await this.findOne(id);
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
        });

        if (!lawyer || service.lawyer.id !== lawyer.id) {
            throw new ForbiddenException('You can only delete your own services');
        }

        return this.lawyerServiceRepository.remove(service);
    }
}

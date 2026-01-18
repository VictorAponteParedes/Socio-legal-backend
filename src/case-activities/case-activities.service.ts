import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseActivity } from './entities/case-activity.entity';
import { CreateCaseActivityDto } from './dto/create-case-activity.dto';
import { Case } from '@/cases/entities/case.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Injectable()
export class CaseActivitiesService {
    constructor(
        @InjectRepository(CaseActivity)
        private caseActivityRepository: Repository<CaseActivity>,
        @InjectRepository(Case)
        private caseRepository: Repository<Case>,
        @InjectRepository(Lawyer)
        private lawyerRepository: Repository<Lawyer>,
    ) { }

    private async getLawyerByUserId(userId: string): Promise<Lawyer> {
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
        });

        if (!lawyer) {
            throw new NotFoundException('Perfil de abogado no encontrado para este usuario');
        }

        return lawyer;
    }

    async create(userId: string, createCaseActivityDto: CreateCaseActivityDto): Promise<CaseActivity> {
        // Get correct lawyer ID first
        const lawyer = await this.getLawyerByUserId(userId);
        const lawyerId = lawyer.id;

        // Debug logging
        console.log('🔍 Creating activity for lawyer:', lawyerId, '(User ID:', userId, ')');
        console.log('📋 Activity data:', createCaseActivityDto);

        // If caseId is provided, verify that the case exists and belongs to the lawyer
        if (createCaseActivityDto.caseId) {
            const caseEntity = await this.caseRepository.findOne({
                where: { id: createCaseActivityDto.caseId },
                relations: ['client'],
            });

            console.log('📁 Case found:', {
                caseId: caseEntity?.id,
                assignedLawyerId: caseEntity?.assignedLawyerId,
                lawyerId,
            });

            if (!caseEntity) {
                throw new NotFoundException('Caso no encontrado');
            }

            if (caseEntity.assignedLawyerId !== lawyerId) {
                console.error('❌ Permission denied:', {
                    assignedLawyerId: caseEntity.assignedLawyerId,
                    requestLawyerId: lawyerId,
                });
                throw new ForbiddenException('No tienes permiso para crear actividades en este caso');
            }
        }

        const activity = this.caseActivityRepository.create({
            ...createCaseActivityDto,
            lawyerId,
            scheduledDate: new Date(createCaseActivityDto.scheduledDate),
        });

        return await this.caseActivityRepository.save(activity);
    }

    async findAllByLawyer(userId: string): Promise<CaseActivity[]> {
        const lawyer = await this.getLawyerByUserId(userId);

        return await this.caseActivityRepository.find({
            where: { lawyerId: lawyer.id },
            relations: ['case', 'case.client'],
            order: { scheduledDate: 'ASC' },
        });
    }

    async findOne(id: number, userId: string): Promise<CaseActivity> {
        const lawyer = await this.getLawyerByUserId(userId);

        const activity = await this.caseActivityRepository.findOne({
            where: { id, lawyerId: lawyer.id },
            relations: ['case', 'case.client'],
        });

        if (!activity) {
            throw new NotFoundException('Actividad no encontrada');
        }

        return activity;
    }

    async update(id: number, userId: string, updateData: Partial<CreateCaseActivityDto>): Promise<CaseActivity> {
        const activity = await this.findOne(id, userId);

        Object.assign(activity, updateData);

        if (updateData.scheduledDate) {
            activity.scheduledDate = new Date(updateData.scheduledDate);
        }

        return await this.caseActivityRepository.save(activity);
    }

    async remove(id: number, userId: string): Promise<void> {
        const activity = await this.findOne(id, userId);
        await this.caseActivityRepository.remove(activity);
    }

    async getLawyerCases(userId: string): Promise<Case[]> {
        const lawyer = await this.getLawyerByUserId(userId);

        return await this.caseRepository.find({
            where: { assignedLawyerId: lawyer.id },
            relations: ['client'],
            order: { createdAt: 'DESC' },
        });
    }
}

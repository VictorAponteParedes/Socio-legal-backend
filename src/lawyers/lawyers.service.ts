import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Lawyer } from './lawyer.entity';
import { User } from '@/users/entities/user.entity';
import { Specialization } from '@/specializations/specialization.entity';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UserStatus } from '@/common/constants/user.constants';

@Injectable()
export class LawyersService {
    constructor(
        @InjectRepository(Lawyer)
        private readonly lawyerRepository: Repository<Lawyer>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Specialization)
        private readonly specializationRepository: Repository<Specialization>,
    ) { }

    /**
     * Obtener todos los abogados con perfil completo y activos
     */
    async findAll(): Promise<Lawyer[]> {
        return await this.lawyerRepository.find({
            where: {
                profileCompleted: true,
                isAvailable: true,
                user: { status: UserStatus.ACTIVE },
            },
            relations: ['user', 'specializations'],
            order: { rating: 'DESC' },
        });
    }

    /**
     * Buscar abogado por ID (público)
     */
    async findOne(id: string): Promise<Lawyer> {
        const lawyer = await this.lawyerRepository.findOne({
            where: {
                id,
                profileCompleted: true,
                user: { status: UserStatus.ACTIVE },
            },
            relations: ['user', 'specializations'],
        });

        if (!lawyer) {
            throw new NotFoundException('Abogado no encontrado');
        }

        return lawyer;
    }

    /**
     * Obtener mi perfil (abogado logueado)
     */
    async getMyProfile(userId: string): Promise<Lawyer> {
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
            relations: ['user', 'specializations'],
        });

        if (!lawyer) {
            throw new NotFoundException('Perfil de abogado no encontrado');
        }

        return lawyer;
    }

    /**
     * Actualizar mi perfil
     */
    async updateMyProfile(
        userId: string,
        updateDto: UpdateLawyerProfileDto,
    ): Promise<Lawyer> {
        const lawyer = await this.getMyProfile(userId);

        // Actualizar especialidades si se enviaron
        if (updateDto.specializationIds && updateDto.specializationIds.length > 0) {
            const specializations = await this.specializationRepository.find({
                where: { id: In(updateDto.specializationIds) },
            });

            if (specializations.length !== updateDto.specializationIds.length) {
                throw new BadRequestException('Algunas especialidades no existen');
            }

            lawyer.specializations = specializations;
        }

        // Actualizar otros campos
        if (updateDto.bio !== undefined) lawyer.bio = updateDto.bio;
        if (updateDto.yearsOfExperience !== undefined) lawyer.yearsOfExperience = updateDto.yearsOfExperience;
        if (updateDto.languages !== undefined) lawyer.languages = updateDto.languages;
        if (updateDto.officeAddress !== undefined) lawyer.officeAddress = updateDto.officeAddress;
        if (updateDto.city !== undefined) lawyer.city = updateDto.city;
        if (updateDto.country !== undefined) lawyer.country = updateDto.country;
        if (updateDto.isAvailable !== undefined) lawyer.isAvailable = updateDto.isAvailable;

        return await this.lawyerRepository.save(lawyer);
    }

    /**
     * Completar perfil (primera vez)
     */
    async completeProfile(
        userId: string,
        completeDto: CompleteProfileDto,
    ): Promise<Lawyer> {
        const lawyer = await this.getMyProfile(userId);

        // Verificar que no esté ya completado
        if (lawyer.profileCompleted) {
            throw new BadRequestException('El perfil ya está completado. Usa el endpoint de actualización.');
        }

        // Obtener especialidades
        const specializations = await this.specializationRepository.find({
            where: { id: In(completeDto.specializationIds) },
        });

        if (specializations.length !== completeDto.specializationIds.length) {
            throw new BadRequestException('Algunas especialidades no existen');
        }

        // Actualizar todos los campos
        lawyer.specializations = specializations;
        lawyer.bio = completeDto.bio;
        lawyer.yearsOfExperience = completeDto.yearsOfExperience;
        lawyer.languages = completeDto.languages;
        lawyer.city = completeDto.city;
        lawyer.country = completeDto.country;
        lawyer.profileCompleted = true; // ← Marca como completado

        return await this.lawyerRepository.save(lawyer);
    }

    /**
     * Buscar abogados por especialidad
     */
    async findBySpecialization(specializationId: number): Promise<Lawyer[]> {
        return await this.lawyerRepository
            .createQueryBuilder('lawyer')
            .innerJoinAndSelect('lawyer.user', 'user')
            .innerJoinAndSelect('lawyer.specializations', 'spec')
            .where('spec.id = :specializationId', { specializationId })
            .andWhere('lawyer.profileCompleted = :completed', { completed: true })
            .andWhere('lawyer.isAvailable = :available', { available: true })
            .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
            .orderBy('lawyer.rating', 'DESC')
            .getMany();
    }

    /**
     * Buscar abogados por ciudad
     */
    async findByCity(city: string): Promise<Lawyer[]> {
        return await this.lawyerRepository.find({
            where: {
                city,
                profileCompleted: true,
                isAvailable: true,
                user: { status: UserStatus.ACTIVE },
            },
            relations: ['user', 'specializations'],
            order: { rating: 'DESC' },
        });
    }

    /**
     * Delete lógico (desactivar abogado)
     */
    async softDelete(userId: string): Promise<{ message: string }> {
        const lawyer = await this.getMyProfile(userId);

        // Marcar usuario como inactivo
        await this.userRepository.update(
            { id: userId },
            { status: UserStatus.INACTIVE },
        );

        // Marcar abogado como no disponible
        lawyer.isAvailable = false;
        await this.lawyerRepository.save(lawyer);

        return { message: 'Cuenta desactivada exitosamente' };
    }

    /**
     * Reactivar cuenta
     */
    async reactivate(userId: string): Promise<{ message: string }> {
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
            relations: ['user'],
        });

        if (!lawyer) {
            throw new NotFoundException('Perfil no encontrado');
        }

        // Reactivar usuario
        await this.userRepository.update(
            { id: userId },
            { status: UserStatus.ACTIVE },
        );

        // Reactivar abogado
        lawyer.isAvailable = true;
        await this.lawyerRepository.save(lawyer);

        return { message: 'Cuenta reactivada exitosamente' };
    }

    /**
     * Verificar si el perfil está completo
     */
    async checkProfileCompletion(userId: string): Promise<{ completed: boolean; missing: string[] }> {
        const lawyer = await this.getMyProfile(userId);

        const missing: string[] = [];

        if (!lawyer.specializations || lawyer.specializations.length === 0) missing.push('specializations');
        if (!lawyer.bio || lawyer.bio.length < 50) missing.push('bio');
        if (!lawyer.yearsOfExperience || lawyer.yearsOfExperience === 0) missing.push('yearsOfExperience');
        if (!lawyer.languages || lawyer.languages.length === 0) missing.push('languages');
        if (!lawyer.city) missing.push('city');
        if (!lawyer.country) missing.push('country');

        return {
            completed: lawyer.profileCompleted && missing.length === 0,
            missing,
        };
    }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lawyer_entity_1 = require("./lawyer.entity");
const user_entity_1 = require("../users/entities/user.entity");
const specialization_entity_1 = require("../specializations/specialization.entity");
const user_constants_1 = require("../common/constants/user.constants");
let LawyersService = class LawyersService {
    constructor(lawyerRepository, userRepository, specializationRepository) {
        this.lawyerRepository = lawyerRepository;
        this.userRepository = userRepository;
        this.specializationRepository = specializationRepository;
    }
    async findAll() {
        return await this.lawyerRepository.find({
            where: {
                profileCompleted: true,
                isAvailable: true,
                user: { status: user_constants_1.UserStatus.ACTIVE },
            },
            relations: ['user', 'specializations'],
            order: { rating: 'DESC' },
        });
    }
    async findOne(id) {
        const lawyer = await this.lawyerRepository.findOne({
            where: {
                id,
                profileCompleted: true,
                user: { status: user_constants_1.UserStatus.ACTIVE },
            },
            relations: ['user', 'specializations'],
        });
        if (!lawyer) {
            throw new common_1.NotFoundException('Abogado no encontrado');
        }
        return lawyer;
    }
    async getMyProfile(userId) {
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
            relations: ['user', 'specializations'],
        });
        if (!lawyer) {
            throw new common_1.NotFoundException('Perfil de abogado no encontrado');
        }
        return lawyer;
    }
    async updateMyProfile(userId, updateDto) {
        const lawyer = await this.getMyProfile(userId);
        if (updateDto.specializationIds && updateDto.specializationIds.length > 0) {
            const specializations = await this.specializationRepository.find({
                where: { id: (0, typeorm_2.In)(updateDto.specializationIds) },
            });
            if (specializations.length !== updateDto.specializationIds.length) {
                throw new common_1.BadRequestException('Algunas especialidades no existen');
            }
            lawyer.specializations = specializations;
        }
        if (updateDto.bio !== undefined)
            lawyer.bio = updateDto.bio;
        if (updateDto.yearsOfExperience !== undefined)
            lawyer.yearsOfExperience = updateDto.yearsOfExperience;
        if (updateDto.languages !== undefined)
            lawyer.languages = updateDto.languages;
        if (updateDto.officeAddress !== undefined)
            lawyer.officeAddress = updateDto.officeAddress;
        if (updateDto.city !== undefined)
            lawyer.city = updateDto.city;
        if (updateDto.country !== undefined)
            lawyer.country = updateDto.country;
        if (updateDto.isAvailable !== undefined)
            lawyer.isAvailable = updateDto.isAvailable;
        return await this.lawyerRepository.save(lawyer);
    }
    async completeProfile(userId, completeDto) {
        const lawyer = await this.getMyProfile(userId);
        if (lawyer.profileCompleted) {
            throw new common_1.BadRequestException('El perfil ya está completado. Usa el endpoint de actualización.');
        }
        const specializations = await this.specializationRepository.find({
            where: { id: (0, typeorm_2.In)(completeDto.specializationIds) },
        });
        if (specializations.length !== completeDto.specializationIds.length) {
            throw new common_1.BadRequestException('Algunas especialidades no existen');
        }
        lawyer.specializations = specializations;
        lawyer.bio = completeDto.bio;
        lawyer.yearsOfExperience = completeDto.yearsOfExperience;
        lawyer.languages = completeDto.languages;
        lawyer.city = completeDto.city;
        lawyer.country = completeDto.country;
        lawyer.profileCompleted = true;
        return await this.lawyerRepository.save(lawyer);
    }
    async findBySpecialization(specializationId) {
        return await this.lawyerRepository
            .createQueryBuilder('lawyer')
            .innerJoinAndSelect('lawyer.user', 'user')
            .innerJoinAndSelect('lawyer.specializations', 'spec')
            .where('spec.id = :specializationId', { specializationId })
            .andWhere('lawyer.profileCompleted = :completed', { completed: true })
            .andWhere('lawyer.isAvailable = :available', { available: true })
            .andWhere('user.status = :status', { status: user_constants_1.UserStatus.ACTIVE })
            .orderBy('lawyer.rating', 'DESC')
            .getMany();
    }
    async findByCity(city) {
        return await this.lawyerRepository.find({
            where: {
                city,
                profileCompleted: true,
                isAvailable: true,
                user: { status: user_constants_1.UserStatus.ACTIVE },
            },
            relations: ['user', 'specializations'],
            order: { rating: 'DESC' },
        });
    }
    async softDelete(userId) {
        const lawyer = await this.getMyProfile(userId);
        await this.userRepository.update({ id: userId }, { status: user_constants_1.UserStatus.INACTIVE });
        lawyer.isAvailable = false;
        await this.lawyerRepository.save(lawyer);
        return { message: 'Cuenta desactivada exitosamente' };
    }
    async reactivate(userId) {
        const lawyer = await this.lawyerRepository.findOne({
            where: { user_id: userId },
            relations: ['user'],
        });
        if (!lawyer) {
            throw new common_1.NotFoundException('Perfil no encontrado');
        }
        await this.userRepository.update({ id: userId }, { status: user_constants_1.UserStatus.ACTIVE });
        lawyer.isAvailable = true;
        await this.lawyerRepository.save(lawyer);
        return { message: 'Cuenta reactivada exitosamente' };
    }
    async checkProfileCompletion(userId) {
        const lawyer = await this.getMyProfile(userId);
        const missing = [];
        if (!lawyer.specializations || lawyer.specializations.length === 0)
            missing.push('specializations');
        if (!lawyer.bio || lawyer.bio.length < 50)
            missing.push('bio');
        if (!lawyer.yearsOfExperience || lawyer.yearsOfExperience === 0)
            missing.push('yearsOfExperience');
        if (!lawyer.languages || lawyer.languages.length === 0)
            missing.push('languages');
        if (!lawyer.city)
            missing.push('city');
        if (!lawyer.country)
            missing.push('country');
        return {
            completed: lawyer.profileCompleted && missing.length === 0,
            missing,
        };
    }
};
exports.LawyersService = LawyersService;
exports.LawyersService = LawyersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lawyer_entity_1.Lawyer)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(specialization_entity_1.Specialization)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LawyersService);
//# sourceMappingURL=lawyers.service.js.map
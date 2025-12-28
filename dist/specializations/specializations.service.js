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
exports.SpecializationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const specialization_entity_1 = require("./specialization.entity");
let SpecializationsService = class SpecializationsService {
    constructor(specializationRepository) {
        this.specializationRepository = specializationRepository;
    }
    async create(createDto) {
        const existing = await this.specializationRepository.findOne({
            where: { name: createDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`La especialización "${createDto.name}" ya existe`);
        }
        const specialization = this.specializationRepository.create(createDto);
        return await this.specializationRepository.save(specialization);
    }
    async findAll() {
        return await this.specializationRepository.find({
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const specialization = await this.specializationRepository.findOne({
            where: { id },
        });
        if (!specialization) {
            throw new common_1.NotFoundException(`Especialización con ID ${id} no encontrada`);
        }
        return specialization;
    }
    async update(id, updateDto) {
        const specialization = await this.findOne(id);
        if (updateDto.name && updateDto.name !== specialization.name) {
            const existing = await this.specializationRepository.findOne({
                where: { name: updateDto.name },
            });
            if (existing) {
                throw new common_1.ConflictException(`La especialización "${updateDto.name}" ya existe`);
            }
        }
        Object.assign(specialization, updateDto);
        return await this.specializationRepository.save(specialization);
    }
    async remove(id) {
        const specialization = await this.findOne(id);
        await this.specializationRepository.remove(specialization);
    }
};
exports.SpecializationsService = SpecializationsService;
exports.SpecializationsService = SpecializationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(specialization_entity_1.Specialization)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SpecializationsService);
//# sourceMappingURL=specializations.service.js.map
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialization } from './specialization.entity';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';

@Injectable()
export class SpecializationsService {
    constructor(
        @InjectRepository(Specialization)
        private readonly specializationRepository: Repository<Specialization>,
    ) { }

    /**
     * Crear una nueva especialización
     */
    async create(createDto: CreateSpecializationDto): Promise<Specialization> {
        // Verificar si ya existe
        const existing = await this.specializationRepository.findOne({
            where: { name: createDto.name },
        });

        if (existing) {
            throw new ConflictException(`La especialización "${createDto.name}" ya existe`);
        }

        const specialization = this.specializationRepository.create(createDto);
        return await this.specializationRepository.save(specialization);
    }

    /**
     * Obtener todas las especializaciones
     */
    async findAll(): Promise<Specialization[]> {
        return await this.specializationRepository.find({
            order: { name: 'ASC' },
        });
    }

    /**
     * Obtener una especialización por ID
     */
    async findOne(id: number): Promise<Specialization> {
        const specialization = await this.specializationRepository.findOne({
            where: { id },
        });

        if (!specialization) {
            throw new NotFoundException(`Especialización con ID ${id} no encontrada`);
        }

        return specialization;
    }

    /**
     * Actualizar una especialización
     */
    async update(id: number, updateDto: UpdateSpecializationDto): Promise<Specialization> {
        const specialization = await this.findOne(id);

        // Si se está actualizando el nombre, verificar que no exista
        if (updateDto.name && updateDto.name !== specialization.name) {
            const existing = await this.specializationRepository.findOne({
                where: { name: updateDto.name },
            });

            if (existing) {
                throw new ConflictException(`La especialización "${updateDto.name}" ya existe`);
            }
        }

        Object.assign(specialization, updateDto);
        return await this.specializationRepository.save(specialization);
    }

    /**
     * Eliminar una especialización
     */
    async remove(id: number): Promise<void> {
        const specialization = await this.findOne(id);
        await this.specializationRepository.remove(specialization);
    }
}

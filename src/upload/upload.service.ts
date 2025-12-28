import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Guardar URL de imagen de perfil en la base de datos
     */
    async updateProfilePicture(userId: string, filename: string): Promise<string> {
        const imageUrl = `/uploads/profiles/${filename}`;

        await this.userRepository.update(
            { id: userId },
            { profilePicture: imageUrl },
        );

        return imageUrl;
    }

    /**
     * Eliminar imagen antigua si existe
     */
    async deleteOldProfilePicture(userId: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (user?.profilePicture) {
            const oldFilePath = path.join(process.cwd(), user.profilePicture);

            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
    }

    /**
     * Validar tipo de archivo
     */
    validateImageFile(file: Express.Multer.File): void {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP',
            );
        }

        // Limitar tamaño a 5MB
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('El archivo excede el tamaño máximo de 5MB');
        }
    }

    /**
     * Generar URL completa de la imagen
     */
    getFullImageUrl(filename: string): string {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/profiles/${filename}`;
    }
}

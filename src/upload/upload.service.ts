import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    onModuleInit() {
        const dirs = [
            './uploads',
            './uploads/profiles',
            './uploads/cases',
            './uploads/chat'
        ];

        dirs.forEach(dir => {
            const fullPath = path.join(process.cwd(), dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

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
    getFullImageUrl(filename: string, folder: string = 'profiles'): string {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        // Quitar trailing slash si existe
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBaseUrl}/uploads/${folder}/${filename}`;
    }
}

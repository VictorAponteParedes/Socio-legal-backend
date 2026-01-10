import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto'; // Usar crypto nativo de Node.js
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    /**
     * Upload de imagen de perfil
     */
    @Post('profile-picture')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/profiles',
                filename: (req, file, callback) => {
                    // Generar nombre único: uuid + extensión original
                    const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
                    callback(null, uniqueName);
                },
            }),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
            fileFilter: (req, file, callback) => {
                // Validar tipo de imagen
                const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

                if (!allowedMimeTypes.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Solo se aceptan imágenes: JPG, PNG, WEBP'),
                        false,
                    );
                }

                callback(null, true);
            },
        }),
    )
    async uploadProfilePicture(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        // Eliminar imagen antigua si existe
        await this.uploadService.deleteOldProfilePicture(user.userId);

        // Guardar nueva URL en la base de datos
        const imageUrl = await this.uploadService.updateProfilePicture(
            user.userId,
            file.filename,
        );

        return {
            message: 'Imagen de perfil actualizada exitosamente',
            url: imageUrl,
            fullUrl: this.uploadService.getFullImageUrl(file.filename),
        };
    }

    /**
     * Upload de archivo general para un caso (PDF, Imagen, Doc)
     */
    @Post('case-file')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/cases',
                filename: (req, file, callback) => {
                    const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
                    callback(null, uniqueName);
                },
            }),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
            },
            fileFilter: (req, file, callback) => {
                const allowedMimeTypes = [
                    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
                ];

                if (!allowedMimeTypes.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Tipo de archivo no permitido. Use imágenes o PDF/DOC.'),
                        false,
                    );
                }

                callback(null, true);
            },
        }),
    )
    async uploadCaseFile(
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        // Return solo la URL relativa
        return {
            message: 'Archivo subido exitosamente',
            url: `/uploads/cases/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype
        };
    }
}

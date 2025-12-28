import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { User } from '@/users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        MulterModule.register({
            dest: './uploads',
        }),
    ],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService],
})
export class UploadModule { }

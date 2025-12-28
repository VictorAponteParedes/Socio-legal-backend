import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LawyersController } from './lawyers.controller';
import { LawyersService } from './lawyers.service';
import { Lawyer } from './lawyer.entity';
import { User } from '@/users/entities/user.entity';
import { Specialization } from '@/specializations/specialization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Lawyer, User, Specialization])],
    controllers: [LawyersController],
    providers: [LawyersService],
    exports: [LawyersService],
})
export class LawyersModule { }

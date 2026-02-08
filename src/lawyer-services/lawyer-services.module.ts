import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LawyerServicesService } from './lawyer-services.service';
import { LawyerServicesController } from './lawyer-services.controller';
import { LawyerService } from './lawyer-service.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LawyerService, Lawyer])],
    controllers: [LawyerServicesController],
    providers: [LawyerServicesService],
})
export class LawyerServicesModule { }

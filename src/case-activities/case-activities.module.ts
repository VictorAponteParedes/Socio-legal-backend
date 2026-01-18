import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseActivitiesService } from './case-activities.service';
import { CaseActivitiesController } from './case-activities.controller';
import { CaseActivity } from './entities/case-activity.entity';
import { Case } from '@/cases/entities/case.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CaseActivity, Case, Lawyer])],
    controllers: [CaseActivitiesController],
    providers: [CaseActivitiesService],
    exports: [CaseActivitiesService],
})
export class CaseActivitiesModule { }

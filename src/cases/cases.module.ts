import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from './entities/case.entity';
import { CaseProposal } from './entities/case-proposal.entity';
import { CaseClosure } from './entities/case-closure.entity';

import { Lawyer } from '@/lawyers/lawyer.entity';
import { User } from '@/users/entities/user.entity';

import { NotificationsModule } from '@/notifications/notifications.module';

import { CaseUpdate } from './entities/case-update.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Case, CaseProposal, Lawyer, User, CaseUpdate, CaseClosure]),
        NotificationsModule
    ],
    controllers: [CasesController],
    providers: [CasesService],
    exports: [CasesService],
})
export class CasesModule { }

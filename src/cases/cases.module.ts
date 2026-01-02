import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from './entities/case.entity';
import { CaseProposal } from './entities/case-proposal.entity';

import { Lawyer } from '@/lawyers/lawyer.entity';
import { User } from '@/users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Case, CaseProposal, Lawyer, User])],
    controllers: [CasesController],
    providers: [CasesService],
    exports: [CasesService],
})
export class CasesModule { }

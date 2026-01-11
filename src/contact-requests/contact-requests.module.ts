import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactRequestsService } from './contact-requests.service';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactRequest } from './entities/contact-request.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ContactRequest, Lawyer])],
    controllers: [ContactRequestsController],
    providers: [ContactRequestsService],
    exports: [ContactRequestsService]
})
export class ContactRequestsModule { }

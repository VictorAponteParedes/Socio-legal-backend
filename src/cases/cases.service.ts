import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { CaseProposal } from './entities/case-proposal.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(CaseProposal)
    private proposalRepository: Repository<CaseProposal>,
    @InjectRepository(Lawyer)
    private lawyerRepository: Repository<Lawyer>,
  ) {}

  async create(clientId: string, createCaseDto: CreateCaseDto) {
    const newCase = this.caseRepository.create({
      ...createCaseDto,
      clientId,
    });
    return await this.caseRepository.save(newCase);
  }

  async findAll() {
    return await this.caseRepository.find({
      relations: ['client', 'assignedLawyer', 'proposals'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(clientId: string) {
    return await this.caseRepository.find({
      where: { clientId },
      relations: ['assignedLawyer', 'proposals'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableCases() {
    return await this.caseRepository.find({
      where: { status: 'pendiente' },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const caseEntity = await this.caseRepository.findOne({
      where: { id },
      relations: ['client', 'assignedLawyer', 'proposals', 'proposals.lawyer'],
    });

    if (!caseEntity) {
      throw new NotFoundException('Caso no encontrado');
    }

    return caseEntity;
  }

  async createProposal(
    caseId: number,
    userId: string,
    createProposalDto: CreateProposalDto,
  ) {
    const caseEntity = await this.findOne(caseId);

    if (caseEntity.status !== 'pendiente') {
      throw new BadRequestException('Este caso ya no está disponible');
    }

    let lawyer = await this.lawyerRepository.findOne({
      where: { user_id: userId },
    });

    if (!lawyer) {
      console.warn(`⚠️ Auto-creando perfil de abogado para user ${userId}`);
      lawyer = this.lawyerRepository.create({
        user_id: userId,
        license: `PENDING-${Date.now()}`,
      });
      lawyer = await this.lawyerRepository.save(lawyer);
    }

    const existingProposal = await this.proposalRepository.findOne({
      where: { caseId, lawyerId: lawyer.id },
    });

    if (existingProposal) {
      throw new BadRequestException('Ya enviaste una propuesta para este caso');
    }

    const proposal = this.proposalRepository.create({
      ...createProposalDto,
      caseId,
      lawyerId: lawyer.id,
    });

    return await this.proposalRepository.save(proposal);
  }

  async acceptProposal(caseId: number, proposalId: number, clientId: string) {
    const caseEntity = await this.findOne(caseId);

    if (caseEntity.clientId !== clientId) {
      throw new BadRequestException(
        'No tienes permiso para aceptar propuestas de este caso',
      );
    }

    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId, caseId },
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    await this.caseRepository.update(caseId, {
      status: 'aceptado',
      assignedLawyerId: proposal.lawyerId,
      acceptedAt: new Date(),
    });

    await this.proposalRepository.update(proposalId, {
      status: 'accepted',
    });

    const otherProposals = await this.proposalRepository.find({
      where: { caseId },
    });

    for (const otherProposal of otherProposals) {
      if (otherProposal.id !== proposalId) {
        await this.proposalRepository.update(otherProposal.id, {
          status: 'rejected',
        });
      }
    }

    return await this.findOne(caseId);
  }
}

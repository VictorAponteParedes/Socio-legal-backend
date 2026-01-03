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
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(CaseProposal)
    private proposalRepository: Repository<CaseProposal>,
    @InjectRepository(Lawyer)
    private lawyerRepository: Repository<Lawyer>,
    private readonly notificationsService: NotificationsService,
  ) { }

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

  async findAvailableCases(userId?: string) {
    const qb = this.caseRepository.createQueryBuilder('case')
      .leftJoinAndSelect('case.client', 'client')
      .leftJoinAndSelect('case.proposals', 'proposals')
      .leftJoinAndSelect('proposals.lawyer', 'lawyer')
      .leftJoinAndSelect('lawyer.user', 'user')
      .orderBy('case.createdAt', 'DESC');

    if (userId) {
      qb.where('case.status = :status', { status: 'pendiente' })
        .orWhere('user.id = :userId', { userId });
    } else {
      qb.where('case.status = :status', { status: 'pendiente' });
    }

    return await qb.getMany();
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
      relations: ['user']
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

    const savedProposal = await this.proposalRepository.save(proposal);

    if (caseEntity.client && caseEntity.client.fcmToken) {
      const lawyerName = lawyer.user ? `${lawyer.user.name} ${lawyer.user.lastname}` : 'Un abogado';

      await this.notificationsService.sendPushNotification(
        caseEntity.client.fcmToken,
        '¡Nueva Propuesta Recibida! ⚖️',
        `${lawyerName} ha enviado una propuesta para tu caso "${caseEntity.title}". Toca para ver detalles.`,
        {
          type: 'info',
          screen: 'ClientMyCases',
          caseId: caseId.toString(),
          proposalId: savedProposal.id.toString(),
          sentTime: new Date().toISOString()
        }
      );
    }

    return savedProposal;
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

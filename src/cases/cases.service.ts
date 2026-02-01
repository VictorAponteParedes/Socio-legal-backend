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
import { CaseUpdate } from './entities/case-update.entity';
import { CreateCaseUpdateDto } from './dto/create-case-update.dto';
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
    @InjectRepository(CaseUpdate)
    private caseUpdateRepository: Repository<CaseUpdate>,
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
      relations: [
        'assignedLawyer',
        'proposals',
        'proposals.lawyer',
        'proposals.lawyer.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableCases(userId?: string) {
    // IMPORTANTE: Todos los abogados deben ver los MISMOS casos disponibles
    // Un caso está "disponible" si status='pendiente' (nadie lo aceptó aún)
    // No importa si yo ya envié propuesta, si el caso sigue pendiente, TODOS lo ven
    const cases = await this.caseRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.client', 'client')
      .leftJoinAndSelect('case.proposals', 'proposals')
      .leftJoinAndSelect('proposals.lawyer', 'lawyer')
      .leftJoinAndSelect('lawyer.user', 'user')
      .where('case.status = :status', { status: 'pendiente' })
      .orderBy('case.createdAt', 'DESC')
      .getMany();

    return cases;
  }

  async findByLawyer(userId: string) {
    const lawyer = await this.lawyerRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!lawyer) {
      throw new NotFoundException('Lawyer profile not found');
    }
    const proposals = await this.proposalRepository.find({
      where: { lawyer: { id: lawyer.id } },
      relations: ['case', 'case.client', 'lawyer', 'lawyer.user'],
      order: { createdAt: 'DESC' },
    });

    const casesMap = new Map();
    proposals.forEach((proposal) => {
      const caseId = proposal.case.id;
      if (!casesMap.has(caseId)) {
        casesMap.set(caseId, {
          ...proposal.case,
          myProposal: proposal,
          proposals: [proposal],
        });
      }
    });

    return Array.from(casesMap.values());
  }

  async findOne(id: number) {
    const caseEntity = await this.caseRepository.findOne({
      where: { id },
      relations: [
        'client',
        'assignedLawyer',
        'assignedLawyer.user',
        'proposals',
        'proposals.lawyer',
        'proposals.lawyer.user',
      ],
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
      relations: ['user'],
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

    // Intentar enviar notificación push, pero NO hacer fallar si hay error
    if (caseEntity.client && caseEntity.client.fcmToken) {
      try {
        const lawyerName = lawyer.user
          ? `${lawyer.user.name} ${lawyer.user.lastname}`
          : 'Un abogado';

        await this.notificationsService.sendPushNotification(
          caseEntity.client.fcmToken,
          '¡Nueva Propuesta Recibida! ⚖️',
          `${lawyerName} ha enviado una propuesta para tu caso "${caseEntity.title}". Toca para ver detalles.`,
          {
            type: 'info',
            screen: 'ClientMyCases',
            caseId: caseId.toString(),
            proposalId: savedProposal.id.toString(),
            sentTime: new Date().toISOString(),
          },
        );
      } catch (error) {
        // Log el error pero NO propagar - la propuesta se guardó exitosamente
        console.error('❌ Error enviando notificación push al cliente:', error.message);
        // TODO: Opcionalmente limpiar token FCM inválido de la base de datos
      }
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
      relations: ['lawyer', 'lawyer.user'],
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

    // Notificar al Abogado (no hacer fallar si hay error)
    if (proposal.lawyer?.user?.fcmToken) {
      try {
        await this.notificationsService.sendPushNotification(
          proposal.lawyer.user.fcmToken,
          '¡Propuesta Aceptada! 🎉',
          `El cliente ha aceptado tu propuesta para el caso "${caseEntity.title}". ¡Es hora de trabajar!`,
          {
            type: 'success',
            screen: 'LawyerCaseDetail',
            caseId: caseId.toString(),
            sentTime: new Date().toISOString(),
          },
        );
      } catch (error) {
        console.error('❌ Error enviando notificación push al abogado:', error.message);
      }
    }

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

  async addCaseUpdate(
    caseId: number,
    userId: string,
    updateDto: CreateCaseUpdateDto,
  ) {
    const caseEntity = await this.findOne(caseId);

    const lawyer = await this.lawyerRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!lawyer) {
      throw new BadRequestException('Usuario no es abogado');
    }

    if (caseEntity.assignedLawyerId !== lawyer.id) {
      // Nota: assignedLawyerId es string (UUID) guardado en DB, lawyer.id es string UUID.
      throw new BadRequestException(
        'No tienes permiso para agregar bitácora a este caso (no asignado)',
      );
    }

    const update = this.caseUpdateRepository.create({
      ...updateDto,
      caseId,
      lawyerId: lawyer.id,
    });

    const savedUpdate = await this.caseUpdateRepository.save(update);

    // Notificar al Cliente (no hacer fallar si hay error)
    if (caseEntity.client && caseEntity.client.fcmToken) {
      try {
        const lawyerName = lawyer.user.name;
        await this.notificationsService.sendPushNotification(
          caseEntity.client.fcmToken,
          'Nueva actualización en tu caso 📋',
          `${lawyerName} agregó: ${updateDto.title}`,
          {
            type: 'info',
            screen: 'ClientCaseDetail',
            caseId: caseId.toString(),
          }
        );
      } catch (error) {
        console.error('❌ Error enviando notificación push al cliente:', error.message);
      }
    }

    return savedUpdate;
  }

  async getCaseUpdates(caseId: number, userId: string) {
    const caseEntity = await this.findOne(caseId);

    // Verifico si es el dueño (cliente)
    // En case.entity, clientId es el user.id asociado al cliente
    // PERO caseEntity.client es el User populateado.
    const isOwner = caseEntity.client.id === userId;

    let isAssignedLawyer = false;
    if (!isOwner) {
      // Chequeo si es el abogado asignado
      const lawyer = await this.lawyerRepository.findOne({ where: { user_id: userId } });
      if (lawyer && lawyer.id === caseEntity.assignedLawyerId) {
        isAssignedLawyer = true;
      }
    }

    if (!isOwner && !isAssignedLawyer) {
      throw new BadRequestException('No tienes permiso para ver la bitácora');
    }

    return await this.caseUpdateRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
      relations: ['lawyer', 'lawyer.user'],
    });
  }
}

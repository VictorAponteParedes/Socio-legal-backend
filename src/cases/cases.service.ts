import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { CaseProposal } from './entities/case-proposal.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CaseUpdate } from './entities/case-update.entity';
import { CreateCaseUpdateDto } from './dto/create-case-update.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { NotificationsService } from '@/notifications/notifications.service';
import { CaseClosure } from './entities/case-closure.entity';
import { CloseCaseDto } from './dto/close-case.dto';

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
    @InjectRepository(CaseClosure)
    private caseClosureRepository: Repository<CaseClosure>,
    private readonly notificationsService: NotificationsService,
  ) { }

  async create(clientId: string, createCaseDto: CreateCaseDto) {
    const newCase = this.caseRepository.create({
      ...createCaseDto,
      clientId,
    });
    return await this.caseRepository.save(newCase);
  }

  async update(id: number, userId: string, updateCaseDto: UpdateCaseDto) {
    const caseEntity = await this.findOne(id);

    if (caseEntity.clientId !== userId) {
      throw new BadRequestException('No tienes permiso para editar este caso');
    }

    if (caseEntity.status !== 'pendiente') {
      throw new BadRequestException('Solo se pueden editar casos pendientes');
    }

    await this.caseRepository.update(id, updateCaseDto);
    return await this.findOne(id);
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
        'closure',
        'closure.closedByUser',
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

  async closeCase(caseId: number, userId: string, closeCaseDto: CloseCaseDto) {
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
      relations: ['client', 'assignedLawyer', 'assignedLawyer.user', 'closure'],
    });

    if (!caseEntity) {
      throw new NotFoundException('Caso no encontrado');
    }

    // SOLO el abogado asignado puede cerrar el caso
    const lawyer = await this.lawyerRepository.findOne({
      where: { user_id: userId },
    });

    if (!lawyer) {
      throw new BadRequestException('Solo los abogados pueden cerrar casos');
    }

    if (lawyer.id !== caseEntity.assignedLawyerId) {
      throw new BadRequestException('Solo el abogado asignado puede cerrar este caso');
    }

    // Verificar que el caso esté en estado 'aceptado'
    if (caseEntity.status !== 'aceptado') {
      throw new BadRequestException('Solo se pueden cerrar casos aceptados');
    }

    // Verificar si ya está cerrado
    if (caseEntity.closure) {
      throw new BadRequestException('Este caso ya está cerrado');
    }

    // Crear el registro de cierre
    const closure = this.caseClosureRepository.create({
      caseId,
      result: closeCaseDto.result,
      closureReason: closeCaseDto.closureReason,
      clientComment: closeCaseDto.clientComment,
      rating: closeCaseDto.rating,
      closedBy: userId,
    });

    await this.caseClosureRepository.save(closure);

    // Actualizar el estado del caso
    await this.caseRepository.update(caseId, {
      status: 'cerrado',
      completedAt: new Date(),
    });

    // Notificar al cliente
    try {
      if (caseEntity.client?.fcmToken) {
        await this.notificationsService.sendPushNotification(
          caseEntity.client.fcmToken,
          'Caso Cerrado 📁',
          `Tu abogado ha cerrado el caso "${caseEntity.title}". Resultado: ${closeCaseDto.result}`,
          {
            type: 'info',
            screen: 'ClientCaseDetail',
            caseId: caseId.toString(),
          },
        );
      }
    } catch (error) {
      console.error('❌ Error enviando notificación de cierre:', error.message);
    }

    return await this.findOne(caseId);
  }

  async getCaseClosure(caseId: number) {
    const closure = await this.caseClosureRepository.findOne({
      where: { caseId },
      relations: ['closedByUser', 'case'],
    });

    return closure;
  }

  async getLawyerRatings(lawyerId: string) {
    const closures = await this.caseClosureRepository
      .createQueryBuilder('closure')
      .leftJoinAndSelect('closure.case', 'case')
      .leftJoinAndSelect('case.client', 'client')
      .where('case.assignedLawyerId = :lawyerId', { lawyerId })
      .andWhere('closure.rating IS NOT NULL')
      .orderBy('closure.closedAt', 'DESC')
      .getMany();

    const ratings = closures.map(c => c.rating).filter(r => r !== null);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

    return {
      averageRating,
      totalRatings: ratings.length,
      closures: closures.map(c => ({
        id: c.id,
        result: c.result,
        rating: c.rating,
        clientComment: c.clientComment,
        closedAt: c.closedAt,
        clientName: c.case?.client ? `${c.case.client.name} ${c.case.client.lastname}` : 'Usuario',
      })),
    };
  }

  async rateCaseClosure(
    caseId: number,
    userId: string,
    ratingData: { rating: number; clientComment: string },
  ) {
    // Verificar que el caso existe y pertenece al cliente
    const caseItem = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseItem) {
      throw new NotFoundException('Caso no encontrado');
    }

    if (caseItem.clientId !== userId) {
      throw new ForbiddenException('No tienes permiso para calificar este caso');
    }

    // Buscar el cierre del caso
    const closure = await this.caseClosureRepository.findOne({
      where: { caseId },
    });

    if (!closure) {
      throw new NotFoundException('Este caso no ha sido cerrado aún');
    }

    if (closure.rating) {
      throw new BadRequestException('Este caso ya ha sido calificado');
    }

    // Validar la calificación
    if (ratingData.rating < 1 || ratingData.rating > 5) {
      throw new BadRequestException('La calificación debe estar entre 1 y 5');
    }

    // Actualizar el cierre con la calificación
    closure.rating = ratingData.rating;
    closure.clientComment = ratingData.clientComment || '';

    await this.caseClosureRepository.save(closure);

    return closure;
  }
}

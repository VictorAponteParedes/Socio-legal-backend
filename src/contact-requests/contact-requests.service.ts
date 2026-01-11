import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContactRequest,
  ContactRequestStatus,
} from './entities/contact-request.entity';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { UpdateContactRequestStatusDto } from './dto/update-contact-request.dto';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Injectable()
export class ContactRequestsService {
  constructor(
    @InjectRepository(ContactRequest)
    private readonly contactRequestRepository: Repository<ContactRequest>,
    @InjectRepository(Lawyer)
    private readonly lawyerRepository: Repository<Lawyer>,
  ) {}

  /**
   * Crear una nueva solicitud de contacto (Cliente -> Abogado)
   */
  async create(
    userId: string,
    createDto: CreateContactRequestDto,
  ): Promise<ContactRequest> {
    // Verificar si existe el abogado
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: createDto.lawyerId },
    });
    if (!lawyer) {
      throw new NotFoundException('Abogado no encontrado');
    }

    // Verificar si ya existe una solicitud pendiente o aceptada
    const existingRequest = await this.contactRequestRepository.findOne({
      where: {
        client_id: userId,
        lawyer_id: createDto.lawyerId,
      },
    });

    if (existingRequest) {
      if (existingRequest.status === ContactRequestStatus.PENDING) {
        throw new ConflictException(
          'Ya tienes una solicitud pendiente con este abogado',
        );
      }
      if (existingRequest.status === ContactRequestStatus.ACCEPTED) {
        throw new ConflictException('Ya estás conectado con este abogado');
      }

      if (existingRequest.status === ContactRequestStatus.REJECTED) {
        existingRequest.status = ContactRequestStatus.PENDING;
        existingRequest.message = createDto.message;
        return await this.contactRequestRepository.save(existingRequest);
      }
    }

    const newRequest = this.contactRequestRepository.create({
      client_id: userId,
      lawyer_id: createDto.lawyerId,
      message: createDto.message,
      status: ContactRequestStatus.PENDING,
    });

    return await this.contactRequestRepository.save(newRequest);
  }

  async findAllForLawyer(lawyerUserId: string): Promise<ContactRequest[]> {
    const lawyer = await this.lawyerRepository.findOne({
      where: { user_id: lawyerUserId },
    });
    if (!lawyer) {
      throw new NotFoundException('Perfil de abogado no encontrado');
    }

    return await this.contactRequestRepository.find({
      where: { lawyer_id: lawyer.id },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener mis solicitudes enviadas (Cliente)
   */
  async findAllForClient(clientId: string): Promise<ContactRequest[]> {
    return await this.contactRequestRepository.find({
      where: { client_id: clientId },
      relations: ['lawyer', 'lawyer.user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar estado de la solicitud (Abogado acepta/rechaza)
   */
  async updateStatus(
    id: string,
    lawyerUserId: string,
    updateDto: UpdateContactRequestStatusDto,
  ): Promise<ContactRequest> {
    const request = await this.contactRequestRepository.findOne({
      where: { id },
      relations: ['lawyer'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Verificar que la solicitud pertenece al abogado que intenta responder
    if (request.lawyer.user_id !== lawyerUserId) {
      throw new ForbiddenException(
        'No tienes permiso para gestionar esta solicitud',
      );
    }

    request.status = updateDto.status;

    const savedRequest = await this.contactRequestRepository.save(request);

    // TODO: Si se acepta, aquí podríamos inicializar el chat room.

    return savedRequest;
  }
}

import { ForbiddenException } from '@nestjs/common';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactRequestsService } from './contact-requests.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { UpdateContactRequestStatusDto } from './dto/update-contact-request.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/user.constants';

@Controller('contact-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactRequestsController {
  constructor(
    private readonly contactRequestsService: ContactRequestsService,
  ) {}

  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: any, @Body() createDto: CreateContactRequestDto) {
    return this.contactRequestsService.create(user.userId, createDto);
  }

  @Get('lawyer')
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  findAllForLawyer(@CurrentUser() user: any) {
    return this.contactRequestsService.findAllForLawyer(user.userId);
  }

  @Get('client')
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  findAllForClient(@CurrentUser() user: any) {
    return this.contactRequestsService.findAllForClient(user.userId);
  }

  /**
   * Abogado: Responder solicitud (Aceptar/Rechazar)
   */
  @Patch(':id/status')
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateContactRequestStatusDto,
  ) {
    return this.contactRequestsService.updateStatus(id, user.userId, updateDto);
  }
}

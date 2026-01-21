import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SearchLawyersDto } from './dto/search-lawyers.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/user.constants';

@Controller('lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) { }

  // ==================== ENDPOINTS PÚBLICOS ====================

  /**
   * Listar todos los abogados (solo con perfil completo)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.lawyersService.findAll();
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  search(@Body() searchDto: SearchLawyersDto) {
    return this.lawyersService.searchLawyers(searchDto);
  }

  /**
   * Ver abogado por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.lawyersService.findOne(id);
  }

  /**
   * Buscar por especialidad
   */
  @Get('specialization/:id')
  @HttpCode(HttpStatus.OK)
  findBySpecialization(@Param('id', ParseIntPipe) id: number) {
    return this.lawyersService.findBySpecialization(id);
  }

  /**
   * Buscar por ciudad
   */
  @Get('city/:city')
  @HttpCode(HttpStatus.OK)
  findByCity(@Param('city') city: string) {
    return this.lawyersService.findByCity(city);
  }

  // ==================== ENDPOINTS PRIVADOS (SOLO ABOGADOS) ====================

  /**
   * Ver mi perfil
   */
  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  getMyProfile(@CurrentUser() user: any) {
    return this.lawyersService.getMyProfile(user.userId);
  }

  /**
   * Verificar estado de completitud del perfil
   */
  @Get('me/completion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  checkProfileCompletion(@CurrentUser() user: any) {
    return this.lawyersService.checkProfileCompletion(user.userId);
  }

  /**
   * Completar perfil (primera vez)
   */
  @Post('me/complete-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  completeProfile(
    @CurrentUser() user: any,
    @Body() completeDto: CompleteProfileDto,
  ) {
    return this.lawyersService.completeProfile(user.userId, completeDto);
  }

  /**
   * Actualizar mi perfil
   */
  @Patch('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateLawyerProfileDto,
  ) {
    return this.lawyersService.updateMyProfile(user.userId, updateDto);
  }

  /**
   * Actualizar mi ubicación
   */
  @Patch('me/location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  updateMyLocation(
    @CurrentUser() user: any,
    @Body() locationDto: UpdateLocationDto,
  ) {
    return this.lawyersService.updateLocation(user.userId, locationDto);
  }

  /**
   * Desactivar mi cuenta (soft delete)
   */
  @Delete('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  softDelete(@CurrentUser() user: any) {
    return this.lawyersService.softDelete(user.userId);
  }

  /**
   * Reactivar mi cuenta
   */
  @Post('me/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.OK)
  reactivate(@CurrentUser() user: any) {
    return this.lawyersService.reactivate(user.userId);
  }
}

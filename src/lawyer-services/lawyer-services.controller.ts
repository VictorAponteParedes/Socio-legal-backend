import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { LawyerServicesService } from './lawyer-services.service';
import { CreateLawyerServiceDto } from './dto/create-lawyer-service.dto';
import { UpdateLawyerServiceDto } from './dto/update-lawyer-service.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/user.constants'; // or enum directly if constants file doesn't exist
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('lawyer-services')
export class LawyerServicesController {
    constructor(private readonly lawyerServicesService: LawyerServicesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.LAWYER)
    create(@CurrentUser() user: any, @Body() createDto: CreateLawyerServiceDto) {
        return this.lawyerServicesService.create(createDto, user.userId);
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.LAWYER)
    findMine(@CurrentUser() user: any) {
        return this.lawyerServicesService.findMine(user.userId);
    }

    @Get('lawyer/:lawyerId')
    findAllByLawyer(@Param('lawyerId') lawyerId: string) {
        return this.lawyerServicesService.findAllByLawyer(lawyerId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.lawyerServicesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.LAWYER)
    update(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() updateDto: UpdateLawyerServiceDto,
    ) {
        return this.lawyerServicesService.update(id, updateDto, user.userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.LAWYER)
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.lawyerServicesService.remove(id, user.userId);
    }
}

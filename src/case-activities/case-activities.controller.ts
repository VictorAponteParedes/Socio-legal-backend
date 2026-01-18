import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { CaseActivitiesService } from './case-activities.service';
import { CreateCaseActivityDto } from './dto/create-case-activity.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/user.constants';

@Controller('case-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LAWYER)
export class CaseActivitiesController {
    constructor(private readonly caseActivitiesService: CaseActivitiesService) { }

    @Post()
    create(@Request() req, @Body() createCaseActivityDto: CreateCaseActivityDto) {
        const lawyerId = req.user.userId;
        return this.caseActivitiesService.create(lawyerId, createCaseActivityDto);
    }

    @Get()
    findAll(@Request() req) {
        const lawyerId = req.user.userId;
        return this.caseActivitiesService.findAllByLawyer(lawyerId);
    }

    @Get('lawyer-cases')
    getLawyerCases(@Request() req) {
        const lawyerId = req.user.userId;
        return this.caseActivitiesService.getLawyerCases(lawyerId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const lawyerId = req.user.userId;
        return this.caseActivitiesService.findOne(id, lawyerId);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() updateData: Partial<CreateCaseActivityDto>,
    ) {
        const lawyerId = req.user.userId;
        return this.caseActivitiesService.update(id, lawyerId, updateData);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const lawyerId = req.user.userId;
        return this.caseActivitiesService.remove(id, lawyerId);
    }
}

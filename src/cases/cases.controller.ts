import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateCaseUpdateDto } from './dto/create-case-update.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) { }

  @Post()
  create(@Request() req, @Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(req.user.userId, createCaseDto);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(+id, req.user.userId, updateCaseDto);
  }

  @Get()
  findAll() {
    return this.casesService.findAll();
  }

  @Get('my-cases')
  findMyCase(@Request() req) {
    return this.casesService.findByClient(req.user.userId);
  }

  @Get('available')
  findAvailable(@Request() req) {
    return this.casesService.findAvailableCases(req.user?.userId);
  }

  @Get('lawyer-cases')
  findLawyerCases(@Request() req) {
    return this.casesService.findByLawyer(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(+id);
  }

  @Post(':id/proposals')
  createProposal(
    @Request() req,
    @Param('id') id: string,
    @Body() createProposalDto: CreateProposalDto,
  ) {
    return this.casesService.createProposal(
      +id,
      req.user.userId,
      createProposalDto,
    );
  }

  @Post(':caseId/proposals/:proposalId/accept')
  acceptProposal(
    @Request() req,
    @Param('caseId') caseId: string,
    @Param('proposalId') proposalId: string,
  ) {
    return this.casesService.acceptProposal(
      +caseId,
      +proposalId,
      req.user.userId,
    );
  }

  @Post(':id/updates')
  addUpdate(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: CreateCaseUpdateDto,
  ) {
    return this.casesService.addCaseUpdate(+id, req.user.userId, updateDto);
  }

  @Get(':id/updates')
  getUpdates(@Request() req, @Param('id') id: string) {
    return this.casesService.getCaseUpdates(+id, req.user.userId);
  }
}

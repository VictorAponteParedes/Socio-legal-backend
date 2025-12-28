import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';

@Controller('specializations')
export class SpecializationsController {
    constructor(private readonly specializationsService: SpecializationsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDto: CreateSpecializationDto) {
        return this.specializationsService.create(createDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    findAll() {
        return this.specializationsService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.specializationsService.findOne(id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateSpecializationDto,
    ) {
        return this.specializationsService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.specializationsService.remove(id);
    }
}

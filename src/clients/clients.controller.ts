import { Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/user.constants';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get('me/profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CLIENT)
    @HttpCode(HttpStatus.OK)
    getMyProfile(@CurrentUser() user: any) {
        return this.clientsService.getMyProfile(user.userId);
    }

    @Patch('me/profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CLIENT)
    @HttpCode(HttpStatus.OK)
    updateMyProfile(
        @CurrentUser() user: any,
        @Body() updateDto: UpdateClientProfileDto,
    ) {
        return this.clientsService.updateMyProfile(user.userId, updateDto);
    }
}

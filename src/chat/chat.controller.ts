import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('init')
    async initChat(@Body() body: { caseId: number; lawyerId: string; clientId: string }) {
        return this.chatService.findOrCreateChat(body.caseId, body.clientId, body.lawyerId);
    }

    @Post('init-direct')
    async initDirectChat(@Body() body: { lawyerId: string; clientId: string }) {
        return this.chatService.findOrCreateDirectChat(body.clientId, body.lawyerId);
    }

    @Get('my-chats')
    async getMyChats(@Request() req) {
        return this.chatService.findMyChats(req.user.userId);
    }

    @Get(':id')
    async getChat(@Param('id') id: string) {
        return this.chatService.findChatById(+id);
    }
}

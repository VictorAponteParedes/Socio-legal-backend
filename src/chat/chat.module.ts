import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Chat, Message]),
        NotificationsModule,
    ],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule { }

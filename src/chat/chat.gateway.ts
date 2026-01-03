import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) { }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.handshake.query.userId as string;

    if (!senderId) {
      return;
    }

    const message = await this.chatService.createMessage(
      senderId,
      createMessageDto,
    );

    this.server
      .to(`chat_${createMessageDto.chatId}`)
      .emit('newMessage', message);
    try {
      const chat = await this.chatRepository.findOne({
        where: { id: createMessageDto.chatId },
        relations: ['client', 'lawyer', 'lawyer.user'],
      });

      if (chat) {
        const recipientUser =
          chat.client.id === senderId ? chat.lawyer.user : chat.client;

        if (recipientUser?.fcmToken) {
          const senderName =
            chat.client.id === senderId
              ? chat.client.name
              : `${chat.lawyer.user.name} ${chat.lawyer.user.lastname}`;

          await this.notificationsService.sendPushNotification(
            recipientUser.fcmToken,
            `Nuevo mensaje de ${senderName}`,
            message.content,
            {
              type: 'chat_message',
              chatId: createMessageDto.chatId.toString(),
              senderId,
              senderName,
            },
          );
        }
      }
    } catch (error) {
      console.error('Error sending chat notification:', error);
    }

    return message;
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat_${chatId}`);
    return { event: 'joinedRoom', room: `chat_${chatId}` };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { chatId: number; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      return;
    }
    client.to(`chat_${data.chatId}`).emit('userTyping', {
      userId,
      isTyping: data.isTyping,
    });
  }
}

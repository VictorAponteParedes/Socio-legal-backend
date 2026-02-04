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

      console.log('💬 Chat notification debug:', {
        chatId: createMessageDto.chatId,
        senderId,
        hasChat: !!chat,
        hasClient: !!chat?.client,
        hasLawyer: !!chat?.lawyer,
        hasLawyerUser: !!chat?.lawyer?.user,
        clientId: chat?.client?.id,
        lawyerId: chat?.lawyer?.id,
        lawyerUserId: chat?.lawyer?.user?.id,
      });

      if (!chat) {
        console.log('❌ Chat not found:', createMessageDto.chatId);
        return message;
      }

      if (!chat.client) {
        console.log('❌ Chat has no client');
        return message;
      }

      // Determine recipient: if sender is client, recipient is lawyer; otherwise client
      let recipientUser;
      let senderName;

      if (chat.client.id === senderId) {
        // Sender is client, recipient is lawyer
        if (!chat.lawyer?.user) {
          console.log('⚠️ Lawyer or lawyer.user not found for chat:', createMessageDto.chatId);
          return message;
        }
        recipientUser = chat.lawyer.user;
        senderName = chat.client.name;
      } else {
        // Sender is lawyer, recipient is client
        recipientUser = chat.client;
        senderName = chat.lawyer?.user
          ? `${chat.lawyer.user.name} ${chat.lawyer.user.lastname}`
          : 'Abogado';
      }

      console.log('📱 Recipient info:', {
        recipientId: recipientUser?.id,
        recipientName: recipientUser?.name,
        hasFcmToken: !!recipientUser?.fcmToken,
        senderName,
      });

      if (recipientUser?.fcmToken) {
        console.log('🔔 Sending push notification:', {
          to: recipientUser.name,
          from: senderName,
          message: message.content.substring(0, 50),
        });

        const notificationBody = message.type === 'image'
          ? '📷 Ha enviado una imagen'
          : message.content;

        await this.notificationsService.sendPushNotification(
          recipientUser.fcmToken,
          `Nuevo mensaje de ${senderName}`,
          notificationBody,
          {
            type: 'chat_message',
            chatId: createMessageDto.chatId.toString(),
            senderId,
            senderName,
          },
        );

        console.log('✅ Push notification sent successfully');
      } else {
        console.log('⚠️ No FCM token found for recipient:', recipientUser?.name);
      }
    } catch (error) {
      console.error('❌ Error sending chat notification:', error);
      console.error('Error stack:', error.stack);
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

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { chatId: number; messageId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    try {
      await this.chatService.removeMessage(data.messageId, userId);

      // Notify everyone in the room to remove the message from UI
      this.server.to(`chat_${data.chatId}`).emit('messageDeleted', {
        messageId: data.messageId,
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }
}

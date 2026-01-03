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

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Client should connect with query: { userId: '...' }
    const senderId = client.handshake.query.userId as string;

    if (!senderId) {
      // Can emit error to client
      return;
    }

    const message = await this.chatService.createMessage(
      senderId,
      createMessageDto,
    );

    // Emit to room (chatId)
    this.server
      .to(`chat_${createMessageDto.chatId}`)
      .emit('newMessage', message);

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

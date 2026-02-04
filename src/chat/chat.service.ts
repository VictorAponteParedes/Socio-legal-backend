import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) { }

  // Regex patterns to detect sensitive info (Phone numbers and Email)
  private phoneRegex =
    /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\d{7,10}/g;
  private emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  private sanitizeContent(content: string): string {
    let sanitized = content.replace(
      this.phoneRegex,
      '[🔒 Oculto por seguridad]',
    );
    sanitized = sanitized.replace(this.emailRegex, '[🔒 Oculto por seguridad]');
    return sanitized;
  }

  async createMessage(senderId: string, createMessageDto: CreateMessageDto) {
    const chat = await this.chatRepository.findOne({
      where: { id: createMessageDto.chatId },
    });
    if (!chat) throw new NotFoundException('Chat no encontrado');

    const sanitizedContent = createMessageDto.content
      ? this.sanitizeContent(createMessageDto.content)
      : null;

    const message = this.messageRepository.create({
      chat,
      sender: { id: senderId } as any,
      content: sanitizedContent,
      imageUrl: createMessageDto.imageUrl,
      type: createMessageDto.type || 'text',
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update chat timestamp
    await this.chatRepository.update(chat.id, { updatedAt: new Date() });

    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });
  }

  async findMyChats(userId: string) {
    // Find chats where user is client OR lawyer (via user relation)
    // Note: Lawyer entity has user_id, so we check lawyer.user.id
    const chats = await this.chatRepository.find({
      relations: ['case', 'client', 'lawyer', 'lawyer.user'],
      order: { updatedAt: 'DESC' },
    });

    // Manual filtering if simple OR query is complex in TypeORM without query builder
    return chats.filter(
      (chat) =>
        chat.client.id === userId ||
        (chat.lawyer.user && chat.lawyer.user.id === userId),
    );
  }

  async findChatById(id: number) {
    return await this.chatRepository.findOne({
      where: { id },
      relations: [
        'messages',
        'messages.sender',
        'client',
        'lawyer',
        'lawyer.user',
      ],
      order: { messages: { createdAt: 'ASC' } },
    });
  }

  async findOrCreateChat(caseId: number, clientId: string, lawyerId: string) {
    // First, try to find chat by caseId only (most important)
    let chat = await this.chatRepository.findOne({
      where: {
        case: { id: caseId },
      },
      relations: [
        'messages',
        'messages.sender',
        'client',
        'lawyer',
        'lawyer.user',
        'case',
      ],
    });

    // If chat exists for this case
    if (chat) {
      console.log(`📱 Found existing chat for case ${caseId}:`, chat.id);

      // If chat exists but has no lawyer assigned, update it
      if (!chat.lawyer && lawyerId) {
        console.log(`🔧 Updating chat ${chat.id} to add lawyer ${lawyerId}`);
        await this.chatRepository.update(chat.id, {
          lawyer: { id: lawyerId } as any,
        });

        // Reload chat with updated lawyer
        chat = await this.chatRepository.findOne({
          where: { id: chat.id },
          relations: [
            'messages',
            'messages.sender',
            'client',
            'lawyer',
            'lawyer.user',
            'case',
          ],
        });
        console.log(`✅ Lawyer assigned to chat ${chat.id}`);
      }

      return chat;
    }

    // If no chat exists, create new one
    console.log(
      `🆕 Creating new chat for case ${caseId}, client: ${clientId}, lawyer: ${lawyerId}`,
    );
    chat = this.chatRepository.create({
      case: { id: caseId } as any,
      client: { id: clientId } as any,
      lawyer: lawyerId ? ({ id: lawyerId } as any) : null,
    });
    await this.chatRepository.save(chat);

    // Reload with relations
    chat = await this.chatRepository.findOne({
      where: { id: chat.id },
      relations: [
        'messages',
        'messages.sender',
        'client',
        'lawyer',
        'lawyer.user',
        'case',
      ],
    });
    chat.messages = chat.messages || [];

    return chat;
  }
  async findOrCreateDirectChat(clientId: string, lawyerId: string) {
    let chat = await this.chatRepository.findOne({
      where: {
        client: { id: clientId },
        lawyer: { id: lawyerId },
        case: null,
      } as any,
      relations: [
        'messages',
        'messages.sender',
        'client',
        'lawyer',
        'lawyer.user',
      ],
    });

    if (chat) {
      return chat;
    }

    chat = this.chatRepository.create({
      client: { id: clientId },
      lawyer: { id: lawyerId },
    });
    await this.chatRepository.save(chat);

    return await this.chatRepository.findOne({
      where: { id: chat.id },
      relations: [
        'messages',
        'messages.sender',
        'client',
        'lawyer',
        'lawyer.user',
      ],
    });
  }
}

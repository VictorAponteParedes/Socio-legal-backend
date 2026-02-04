import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '@/users/entities/user.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Chat, (chat) => chat.messages)
    @JoinColumn({ name: 'chatId' })
    chat: Chat;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @Column('text', { nullable: true })
    content: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({
        type: 'enum',
        enum: ['text', 'image'],
        default: 'text'
    })
    type: 'text' | 'image';

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}

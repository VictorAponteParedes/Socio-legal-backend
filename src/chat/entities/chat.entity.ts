import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Case } from '@/cases/entities/case.entity';
import { User } from '@/users/entities/user.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Case, { nullable: true })
    @JoinColumn({ name: 'caseId' })
    case: Case;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'clientId' })
    client: User;

    @ManyToOne(() => Lawyer)
    @JoinColumn({ name: 'lawyerId' })
    lawyer: Lawyer;

    @OneToMany(() => Message, (message) => message.chat)
    messages: Message[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

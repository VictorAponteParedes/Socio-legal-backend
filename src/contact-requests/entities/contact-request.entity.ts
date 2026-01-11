import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

export enum ContactRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

@Entity('contact_requests')
export class ContactRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'client_id' })
    client: User;

    @Column()
    client_id: string;

    @ManyToOne(() => Lawyer)
    @JoinColumn({ name: 'lawyer_id' })
    lawyer: Lawyer;

    @Column()
    lawyer_id: string;

    @Column({
        type: 'enum',
        enum: ContactRequestStatus,
        default: ContactRequestStatus.PENDING
    })
    status: ContactRequestStatus;

    @Column({ type: 'text', nullable: true })
    message: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

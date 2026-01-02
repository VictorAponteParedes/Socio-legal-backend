import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { CaseProposal } from './case-proposal.entity';

@Entity('cases')
export class Case {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clientId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'clientId' })
    client: User;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column()
    category: string;

    @Column({ default: 'media' })
    urgency: string;

    @Column({ nullable: true })
    budget: number;

    @Column({ nullable: true })
    documentUrl: string;

    @Column({ default: 'pendiente' })
    status: string;

    @Column({ nullable: true })
    assignedLawyerId: string;

    @ManyToOne(() => Lawyer, { nullable: true })
    @JoinColumn({ name: 'assignedLawyerId' })
    assignedLawyer: Lawyer;

    @OneToMany(() => CaseProposal, (proposal) => proposal.case)
    proposals: CaseProposal[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    acceptedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;
}

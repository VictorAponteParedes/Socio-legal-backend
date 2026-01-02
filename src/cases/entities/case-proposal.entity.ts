import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Case } from './case.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Entity('case_proposals')
export class CaseProposal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    caseId: number;

    @ManyToOne(() => Case, caseEntity => caseEntity.proposals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'caseId' })
    case: Case;

    @Column()
    lawyerId: string;

    @ManyToOne(() => Lawyer)
    @JoinColumn({ name: 'lawyerId' })
    lawyer: Lawyer;

    @Column('text')
    message: string;

    @Column({ nullable: true })
    proposedFee: number;

    @Column({ nullable: true })
    estimatedDuration: string;

    @Column({ default: 'pending' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}

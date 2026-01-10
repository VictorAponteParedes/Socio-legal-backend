import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Case } from './case.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

export enum CaseUpdateType {
    NOTE = 'NOTE',
    FILE = 'FILE',
    MEETING = 'MEETING',
    MILESTONE = 'MILESTONE',
}

@Entity('case_updates')
export class CaseUpdate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    caseId: number;

    @ManyToOne('Case', (caseEntity: Case) => caseEntity.updates, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'caseId' })
    case: Case;

    @Column()
    lawyerId: string;

    @ManyToOne(() => Lawyer, { nullable: false })
    @JoinColumn({ name: 'lawyerId' })
    lawyer: Lawyer;

    @Column({
        type: 'enum',
        enum: CaseUpdateType,
        default: CaseUpdateType.NOTE
    })
    type: CaseUpdateType;

    @Column()
    title: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ nullable: true })
    attachmentUrl: string;

    @Column({ type: 'timestamp', nullable: true })
    eventDate: Date;

    @CreateDateColumn()
    createdAt: Date;
}

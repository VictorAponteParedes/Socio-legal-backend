import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Case } from '@/cases/entities/case.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

export enum ActivityType {
    HEARING = 'hearing',
    DEADLINE = 'deadline',
    MEETING = 'meeting',
    CONSULTATION = 'consultation',
    DILIGENCE = 'diligence',
    EXPERTISE = 'expertise',
}

@Entity('case_activities')
export class CaseActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    lawyerId: string;

    @ManyToOne(() => Lawyer)
    @JoinColumn({ name: 'lawyerId' })
    lawyer: Lawyer;

    @Column({ nullable: true })
    caseId: number | null;

    @ManyToOne(() => Case, { nullable: true })
    @JoinColumn({ name: 'caseId' })
    case: Case | null;

    @Column({
        type: 'enum',
        enum: ActivityType,
    })
    type: ActivityType;

    @Column()
    name: string;

    @Column({ type: 'timestamp' })
    scheduledDate: Date;

    @Column({ type: 'time' })
    scheduledTime: string;

    @Column({ nullable: true })
    documentUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Case } from './case.entity';
import { User } from '@/users/entities/user.entity';

export enum CaseResult {
    SUCCESSFUL = 'exitoso',
    FAILED = 'fallido',
    SETTLED = 'acuerdo',
    DISMISSED = 'desestimado',
    WITHDRAWN = 'retirado',
}

@Entity('case_closures')
export class CaseClosure {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    caseId: number;

    @OneToOne(() => Case, (caseEntity) => caseEntity.closure, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'caseId' })
    case: Case;

    @Column({
        type: 'enum',
        enum: CaseResult,
    })
    result: CaseResult;

    @Column('text')
    closureReason: string;

    @Column({ nullable: true })
    clientComment: string;

    @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
    rating: number;

    @Column()
    closedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'closedBy' })
    closedByUser: User;

    @CreateDateColumn()
    closedAt: Date;
}

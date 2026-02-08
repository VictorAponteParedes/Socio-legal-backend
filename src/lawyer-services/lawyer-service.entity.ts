import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Entity('lawyer_services')
export class LawyerService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column()
    duration: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Lawyer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lawyer_id' })
    lawyer: Lawyer;

    @Column()
    lawyer_id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

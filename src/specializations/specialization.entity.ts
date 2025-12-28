import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Entity('specializations')
export class Specialization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 100 })
    name: string; // ej: 'Derecho Civil'

    @Column({ type: 'text', nullable: true })
    description?: string; // Descripción de la especialización

    // Relación Many-to-Many con Lawyers (lado inverso)
    @ManyToMany(() => Lawyer, (lawyer) => lawyer.specializations)
    lawyers: Lawyer[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}

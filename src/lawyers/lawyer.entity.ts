import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity('lawyers')
export class Lawyer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Relación 1-1 con User
    @OneToOne(() => User, (user) => user.lawyer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    user_id: string;

    // Campos específicos de Abogado
    @Column({ type: 'varchar', length: 100, unique: true })
    license: string; // Matrícula profesional

    @Column({ type: 'text', nullable: true })
    bio?: string;

    @Column({ type: 'simple-array', nullable: true })
    specializations?: string[]; // Array de IDs o nombres

    @Column({ type: 'int', default: 0 })
    yearsOfExperience: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    rating: number; // Rating promedio de 0 a 5

    @Column({ type: 'int', default: 0 })
    totalReviews: number;

    @Column({ type: 'simple-array', nullable: true })
    languages?: string[]; // ['Español', 'Guaraní', 'Inglés']

    @Column({ type: 'boolean', default: true })
    isAvailable: boolean; // Si acepta nuevos clientes

    @Column({ type: 'text', nullable: true })
    officeAddress?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country?: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}

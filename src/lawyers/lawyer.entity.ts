import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Specialization } from '@/specializations/specialization.entity';
import { LawyerService } from '@/lawyer-services/lawyer-service.entity';

@Entity('lawyers')
export class Lawyer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.lawyer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    license: string;

    @Column({ type: 'text', nullable: true })
    bio?: string;

    @ManyToMany(() => Specialization, { eager: false })
    @JoinTable({
        name: 'lawyer_specializations',
        joinColumn: { name: 'lawyer_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'specialization_id', referencedColumnName: 'id' },
    })
    specializations: Specialization[];

    @OneToMany(() => LawyerService, (service) => service.lawyer)
    services: LawyerService[];

    @Column({ type: 'int', default: 0 })
    yearsOfExperience: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    rating: number;

    @Column({ type: 'int', default: 0 })
    totalReviews: number;

    @Column({ type: 'simple-array', nullable: true })
    languages?: string[];

    @Column({ type: 'boolean', default: true })
    isAvailable: boolean;

    @Column({ type: 'text', nullable: true })
    officeAddress?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country?: string;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude?: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude?: number;

    @Column({ type: 'boolean', default: false })
    profileCompleted: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}

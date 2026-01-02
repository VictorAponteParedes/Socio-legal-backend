import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity('password_reset_codes')
export class PasswordResetCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ length: 6 })
    code: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@/common/constants/user.constants';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    lastname: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, select: false })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    role: UserRole;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @Column({ type: 'varchar', length: 255, nullable: true })
    profilePicture?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'varchar', nullable: true })
    fcmToken?: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    // Relaciones
    @OneToOne(() => Client, (client) => client.user, { nullable: true })
    client?: Client;

    @OneToOne(() => Lawyer, (lawyer) => lawyer.user, { nullable: true })
    lawyer?: Lawyer;

    // Métodos
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    getFullName(): string {
        return `${this.name} ${this.lastname}`;
    }
}

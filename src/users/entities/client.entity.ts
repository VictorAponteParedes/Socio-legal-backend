import { Entity, ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../../common/constants/user.constants';

@ChildEntity(UserRole.CLIENT)
export class Client extends User {
    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country?: string;

    @Column({ type: 'text', nullable: true })
    preferences?: string;
}

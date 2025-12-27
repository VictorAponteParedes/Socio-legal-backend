import { Entity, ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../../common/constants/user.constants';

@ChildEntity(UserRole.LAWYER)
export class Lawyer extends User {
  @Column({ type: 'varchar', length: 100, unique: true })
  license: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'simple-array', nullable: true })
  specializations?: string[];

  @Column({ type: 'int', default: 0 })
  yearsOfExperience?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating?: number;

  @Column({ type: 'int', default: 0 })
  totalReviews?: number;

  @Column({ type: 'text', nullable: true })
  languages?: string;

  @Column({ type: 'boolean', default: true })
  isAvailable?: boolean;

  @Column({ type: 'text', nullable: true })
  officeAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;
}

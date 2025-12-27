import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants/user.constants';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

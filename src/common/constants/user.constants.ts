export enum UserRole {
    CLIENT = 'client',
    LAWYER = 'lawyer',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
}

export const USER_ROLE_VALUES = Object.values(UserRole);
export const USER_STATUS_VALUES = Object.values(UserStatus);

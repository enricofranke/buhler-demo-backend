export interface CreateUserDto {
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string;
}

import type { JsonValue } from '@prisma/client/runtime/library';

export interface UserRole {
  readonly id: string;
  readonly isActive: boolean;
  readonly assignedAt: Date;
  readonly expiresAt: Date | null;
  readonly role: {
    readonly id: string;
    readonly name: string;
    readonly displayName: string;
    readonly description: string | null;
    readonly permissions: JsonValue | null;
  };
}

export interface UserWithRoles {
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly displayName: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt: Date | null;
  readonly userRoles: readonly UserRole[];
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly displayName: string | null;
  readonly roles: readonly string[];
  readonly isActive: boolean;
  readonly lastLoginAt: Date | null;
} 
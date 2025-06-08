import type { JsonValue } from '@prisma/client/runtime/library';

export interface Role {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly isSystem: boolean;
  readonly permissions: JsonValue | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserRoleAssignment {
  readonly id: string;
  readonly userId: string;
  readonly roleId: string;
  readonly assignedBy: string | null;
  readonly assignedAt: Date;
  readonly expiresAt: Date | null;
  readonly isActive: boolean;
  readonly role: Role;
}



export interface CreateRoleData {
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
  readonly isSystem?: boolean;
  readonly permissions?: JsonValue | null;
} 
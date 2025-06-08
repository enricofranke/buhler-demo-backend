import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Role, CreateRoleData } from './types/role.interface';

/**
 * Service responsible for role management operations
 */
@Injectable()
export class RolesService {


  private readonly defaultRoleDisplayNames: Record<string, string> = {
    'USER': 'Standard User',
    'ADMIN': 'Administrator',
    'SALES': 'Sales Representative',
    'MODERATOR': 'Moderator',
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get role IDs by role names
   */
  async getRoleIdsByNames(roleNames: readonly string[]): Promise<string[]> {
    const existingRoles = await this.findRolesByNames(roleNames);
    const existingRoleNames = this.extractRoleNames(existingRoles);
    const missingRoleNames = this.findMissingRoleNames(roleNames, existingRoleNames);
    if (missingRoleNames.length > 0) {
      await this.createMissingRoles(missingRoleNames);
      const newRoles = await this.findRolesByNames(missingRoleNames);
      existingRoles.push(...newRoles);
    }
    return this.extractRoleIds(existingRoles);
  }



  /**
   * Assign roles to user
   */
  async assignRolesToUser(userId: string, roleIds: readonly string[]): Promise<void> {
    const userRoles = this.buildUserRoleAssignments(userId, roleIds);
    await this.prisma.userRole.createMany({
      data: userRoles,
      skipDuplicates: true,
    });
  }

  /**
   * Get user roles by user ID
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: {
          select: { name: true },
        },
      },
    });
    return userRoles.map(userRole => userRole.role.name);
  }

  /**
   * Sync user roles - remove obsolete and add new ones
   */
  async syncUserRoles(userId: string, newRoleIds: readonly string[]): Promise<void> {
    const currentRoleIds = await this.getCurrentSystemRoleIds(userId);
    await this.removeObsoleteRoles(userId, currentRoleIds, newRoleIds);
    await this.addNewRoles(userId, currentRoleIds, newRoleIds);
  }

  /**
   * Check if user has specific role
   */
  async hasUserRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes(roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasUserAnyRole(userId: string, roleNames: readonly string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return roleNames.some(roleName => userRoles.includes(roleName));
  }

  private async findRolesByNames(roleNames: readonly string[]): Promise<Role[]> {
    return this.prisma.role.findMany({
      where: {
        name: { in: roleNames as string[] },
        isActive: true,
      },
    }) as Promise<Role[]>;
  }

  private extractRoleNames(roles: readonly Role[]): string[] {
    return roles.map(role => role.name);
  }

  private extractRoleIds(roles: readonly Role[]): string[] {
    return roles.map(role => role.id);
  }

  private findMissingRoleNames(
    requestedNames: readonly string[], 
    existingNames: readonly string[]
  ): string[] {
    return requestedNames.filter(name => !existingNames.includes(name));
  }



  private async createMissingRoles(roleNames: readonly string[]): Promise<void> {
    const rolesToCreate = this.buildCreateRoleData(roleNames);
    await this.prisma.role.createMany({
      data: rolesToCreate.map(role => ({
        ...role,
        permissions: undefined
      })),
      skipDuplicates: true,
    });
  }

  private buildCreateRoleData(roleNames: readonly string[]): CreateRoleData[] {
    return roleNames.map(name => ({
      name,
      displayName: this.defaultRoleDisplayNames[name] || name,
      description: `${this.defaultRoleDisplayNames[name] || name} role`,
      isSystem: true,
    }));
  }

  private buildUserRoleAssignments(userId: string, roleIds: readonly string[]): Array<{
    userId: string;
    roleId: string;
    assignedBy: string;
  }> {
    return roleIds.map(roleId => ({
      userId,
      roleId,
      assignedBy: 'SYSTEM',
    }));
  }

  private async getCurrentSystemRoleIds(userId: string): Promise<string[]> {
    const currentSystemRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        assignedBy: 'SYSTEM',
        isActive: true,
      },
    });
    return currentSystemRoles.map(userRole => userRole.roleId);
  }

  private async removeObsoleteRoles(
    userId: string,
    currentRoleIds: readonly string[],
    newRoleIds: readonly string[]
  ): Promise<void> {
    const rolesToRemove = this.findRolesToRemove(currentRoleIds, newRoleIds);
    if (rolesToRemove.length > 0) {
      await this.deactivateUserRoles(userId, rolesToRemove);
    }
  }

  private async addNewRoles(
    userId: string,
    currentRoleIds: readonly string[],
    newRoleIds: readonly string[]
  ): Promise<void> {
    const rolesToAdd = this.findRolesToAdd(currentRoleIds, newRoleIds);
    if (rolesToAdd.length > 0) {
      await this.assignRolesToUser(userId, rolesToAdd);
    }
  }

  private findRolesToRemove(
    currentRoleIds: readonly string[], 
    newRoleIds: readonly string[]
  ): string[] {
    return currentRoleIds.filter(id => !newRoleIds.includes(id));
  }

  private findRolesToAdd(
    currentRoleIds: readonly string[], 
    newRoleIds: readonly string[]
  ): string[] {
    return newRoleIds.filter(id => !currentRoleIds.includes(id));
  }

  private async deactivateUserRoles(userId: string, roleIds: readonly string[]): Promise<void> {
    await this.prisma.userRole.updateMany({
      where: {
        userId,
        roleId: { in: roleIds as string[] },
        assignedBy: 'SYSTEM',
      },
      data: { isActive: false },
    });
  }
} 
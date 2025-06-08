import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserWithRoles } from '../../users/types/user.interface';

/**
 * Guard to check if user has required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.getRequiredRoles(context);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const user = this.getUserFromRequest(context);
    if (!user) {
      return false;
    }
    return this.hasUserRequiredRoles(user, requiredRoles);
  }

  private getRequiredRoles(context: ExecutionContext): string[] | undefined {
    return this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private getUserFromRequest(context: ExecutionContext): UserWithRoles | null {
    const request = context.switchToHttp().getRequest();
    return request.user || null;
  }

  private hasUserRequiredRoles(user: UserWithRoles, requiredRoles: string[]): boolean {
    const userRoles = this.extractUserRoles(user);
    return requiredRoles.some(requiredRole => userRoles.includes(requiredRole));
  }

  private extractUserRoles(user: UserWithRoles): string[] {
    return user.userRoles.map(userRole => userRole.role.name);
  }
} 
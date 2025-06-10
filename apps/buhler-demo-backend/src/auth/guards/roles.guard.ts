import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface UserRole {
  isActive: boolean;
  expiresAt: Date | null;
  role: {
    name: string;
  };
}

/**
 * Guard to check if user has required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has any of the required roles
    const userRoles = user.userRoles || [];
    const hasRole = requiredRoles.some((role) => 
      userRoles.some((userRole: UserRole) => 
        userRole.isActive && 
        userRole.role?.name === role &&
        (!userRole.expiresAt || new Date() < new Date(userRole.expiresAt))
      )
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
} 
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import type { UserWithRoles } from '../users/types/user.interface';
import type { AuthResponse, JwtPayload } from './types/auth.interface';

/**
 * Service responsible for authentication and authorization
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<UserWithRoles | null> {
    return this.usersService.findUserById(id);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<UserWithRoles | null> {
    return this.usersService.findUserByEmail(email);
  }

  /**
   * Generate access token for user
   */
  async generateAccessToken(user: UserWithRoles): Promise<string> {
    const roles = this.usersService.extractUserRoleNames(user);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: roles[0] || 'USER',
      roles: roles,
    };
    return this.jwtService.signAsync(payload);
  }

  /**
   * Login user and return auth response
   */
  async login(user: UserWithRoles): Promise<AuthResponse> {
    const accessToken = await this.generateAccessToken(user);
    return {
      user,
      accessToken,
    };
  }

  /**
   * Validate user for authentication
   */
  async validateUser(email: string): Promise<UserWithRoles | null> {
    const user = await this.findUserByEmail(email);
    if (!this.usersService.isUserValid(user)) {
      return null;
    }
    return user;
  }

  /**
   * Get user roles by user ID
   */
  async getUserRoles(userId: string): Promise<string[]> {
    return this.rolesService.getUserRoles(userId);
  }

  /**
   * Check if user has specific role
   */
  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    return this.rolesService.hasUserRole(userId, roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  async userHasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    return this.rolesService.hasUserAnyRole(userId, roleNames);
  }
} 
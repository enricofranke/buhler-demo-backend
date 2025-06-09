import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { 
  UserWithRoles, 
  CreateUserDto,
  UserProfile 
} from './types/user.interface';

/**
 * Service responsible for user-related database operations
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID with roles
   */
  async findUserById(id: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.buildUserIncludeOptions(),
    });
    return user as UserWithRoles | null;
  }

  /**
   * Find user by email with roles
   */
  async findUserByEmail(email: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.buildUserIncludeOptions(),
    }) as Promise<UserWithRoles | null>;
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserDto): Promise<UserWithRoles> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        passwordHash: userData.passwordHash,
        lastLoginAt: new Date(),
      },
      include: this.buildUserIncludeOptions(),
    });
    return user as UserWithRoles;
  }

  /**
   * Update existing user
   */
  async updateUser(
    userId: string, 
    userData: Partial<CreateUserDto>
  ): Promise<UserWithRoles> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
        lastLoginAt: new Date(),
      },
      include: this.buildUserIncludeOptions(),
    });
    return user as UserWithRoles;
  }

  /**
   * Convert UserWithRoles to UserProfile
   */
  convertToUserProfile(user: UserWithRoles): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      roles: this.extractUserRoleNames(user),
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Check if user is active and valid
   */
  isUserValid(user: UserWithRoles | null): boolean {
    return user !== null && user.isActive;
  }

  /**
   * Get user roles as string array
   */
  extractUserRoleNames(user: UserWithRoles): string[] {
    return user.userRoles.map(userRole => userRole.role.name);
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }



  private buildUserIncludeOptions() {
    return {
      userRoles: {
        where: { isActive: true },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
              description: true,
              permissions: true,
            },
          },
        },
      },
    };
  }
} 
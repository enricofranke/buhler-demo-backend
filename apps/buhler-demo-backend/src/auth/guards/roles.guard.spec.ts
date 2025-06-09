import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserWithRoles } from '../../users/types/user.interface';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockUser: UserWithRoles = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    isActive: true,
    lastLoginAt: new Date('2024-01-01T00:00:00.000Z'),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    userRoles: [
      {
        id: 'role1',
        isActive: true,
        assignedAt: new Date('2024-01-01T00:00:00.000Z'),
        expiresAt: null,
        role: {
          id: 'admin-role-id',
          name: 'ADMIN',
          displayName: 'Administrator',
          description: 'Administrator role',
          permissions: null,
        },
      },
      {
        id: 'role2',
        isActive: true,
        assignedAt: new Date('2024-01-01T00:00:00.000Z'),
        expiresAt: null,
        role: {
          id: 'sales-role-id',
          name: 'SALES',
          displayName: 'Sales Representative',
          description: 'Sales role',
          permissions: null,
        },
      },
    ],
  };

  const createMockExecutionContext = (user?: UserWithRoles): ExecutionContext => {
    const mockRequest = {
      user: user || null,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should return true when required roles array is empty', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue([]);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when no user is present in request', () => {
      // Arrange
      const context = createMockExecutionContext();
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true when user has required role', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when user has any of the required roles', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue(['MANAGER', 'ADMIN']);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have any required roles', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue(['MANAGER', 'SUPPORT']);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true when user has SALES role', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue(['SALES']);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user has no roles', () => {
      // Arrange
      const userWithoutRoles: UserWithRoles = {
        ...mockUser,
        userRoles: [],
      };
      const context = createMockExecutionContext(userWithoutRoles);
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for case-sensitive role comparison', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue(['admin']); // lowercase

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true when user has single role matching requirement', () => {
      // Arrange
      const userWithSingleRole: UserWithRoles = {
        ...mockUser,
        userRoles: [
          {
            id: 'role1',
            isActive: true,
            assignedAt: new Date('2024-01-01T00:00:00.000Z'),
            expiresAt: null,
            role: {
              id: 'user-role-id',
              name: 'USER',
              displayName: 'User',
              description: 'User role',
              permissions: null,
            },
          },
        ],
      };
      const context = createMockExecutionContext(userWithSingleRole);
      reflector.getAllAndOverride.mockReturnValue(['USER']);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user has different roles than required', () => {
      // Arrange
      const userWithDifferentRole: UserWithRoles = {
        ...mockUser,
        userRoles: [
          {
            id: 'role1',
            isActive: true,
            assignedAt: new Date('2024-01-01T00:00:00.000Z'),
            expiresAt: null,
            role: {
              id: 'guest-role-id',
              name: 'GUEST',
              displayName: 'Guest',
              description: 'Guest role',
              permissions: null,
            },
          },
        ],
      };
      const context = createMockExecutionContext(userWithDifferentRole);
      reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MANAGER', 'SALES']);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('edge cases', () => {
    it('should throw ForbiddenException when user object is undefined', () => {
      // Arrange
      const mockRequest = { user: undefined };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle null roles array from reflector', () => {
      // Arrange
      const context = createMockExecutionContext(mockUser);
      reflector.getAllAndOverride.mockReturnValue(null);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });
  });
}); 
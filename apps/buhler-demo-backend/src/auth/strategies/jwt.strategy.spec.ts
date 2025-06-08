import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import type { JwtPayload } from '../types/auth.interface';
import type { UserWithRoles } from '../../users/types/user.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

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
    ],
  };

  const mockJwtPayload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'ADMIN',
    roles: ['ADMIN'],
  };

  beforeEach(async () => {
    const mockAuthService = {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      generateAccessToken: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      getUserRoles: jest.fn(),
      userHasRole: jest.fn(),
      userHasAnyRole: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with JWT_SECRET from config', () => {
      // Arrange
      configService.get.mockReturnValue('test-secret');

      // Act
      const newStrategy = new JwtStrategy(authService, configService);

      // Assert
      expect(newStrategy).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should use default secret when JWT_SECRET is not provided', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const newStrategy = new JwtStrategy(authService, configService);

      // Assert
      expect(newStrategy).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  describe('validate', () => {
    it('should return user when validation is successful', async () => {
      // Arrange
      authService.findUserById.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate(mockJwtPayload);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authService.findUserById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      authService.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found')
      );
      expect(authService.findUserById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      authService.findUserById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User account is inactive')
      );
      expect(authService.findUserById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });

    it('should handle user with minimal data', async () => {
      // Arrange
      const minimalUser: UserWithRoles = {
        ...mockUser,
        firstName: null,
        lastName: null,
        displayName: null,
        lastLoginAt: null,
        userRoles: [],
      };
      authService.findUserById.mockResolvedValue(minimalUser);

      // Act
      const result = await strategy.validate(mockJwtPayload);

      // Assert
      expect(result).toEqual(minimalUser);
    });

    it('should handle different JWT payload formats', async () => {
      // Arrange
      const differentPayload: JwtPayload = {
        sub: 'different-user-id',
        email: 'different@example.com',
        role: 'USER',
        roles: ['USER'],
      };
      const differentUser = { ...mockUser, id: 'different-user-id' };
      authService.findUserById.mockResolvedValue(differentUser);

      // Act
      const result = await strategy.validate(differentPayload);

      // Assert
      expect(result).toEqual(differentUser);
      expect(authService.findUserById).toHaveBeenCalledWith('different-user-id');
    });
  });
}); 
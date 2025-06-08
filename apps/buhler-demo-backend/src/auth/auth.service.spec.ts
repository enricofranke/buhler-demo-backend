import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import type { UserWithRoles } from '../users/types/user.interface';
import type { JwtPayload } from './types/auth.interface';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let usersService: jest.Mocked<UsersService>;
  let rolesService: jest.Mocked<RolesService>;

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

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockUsersService = {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      extractUserRoleNames: jest.fn(),
      isUserValid: jest.fn(),
      convertToUserProfile: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    };

    const mockRolesService = {
      getUserRoles: jest.fn(),
      hasUserRole: jest.fn(),
      hasUserAnyRole: jest.fn(),
      assignRolesToUser: jest.fn(),
      syncUserRoles: jest.fn(),
      getRoleIdsByNames: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    usersService = module.get(UsersService);
    rolesService = module.get(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserById', () => {
    it('should find user by id', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      usersService.findUserById.mockResolvedValue(mockUser);

      // Act
      const result = await service.findUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      usersService.findUserById.mockResolvedValue(null);

      // Act
      const result = await service.findUserById(userId);

      // Assert
      expect(result).toBeNull();
      expect(usersService.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const email = 'test@example.com';
      usersService.findUserByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await service.findUserByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      usersService.findUserByEmail.mockResolvedValue(null);

      // Act
      const result = await service.findUserByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token with user data', async () => {
      // Arrange
      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const expectedPayload: JwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: 'ADMIN',
        roles: ['ADMIN'],
      };

      usersService.extractUserRoleNames.mockReturnValue(['ADMIN']);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.generateAccessToken(mockUser);

      // Assert
      expect(result).toEqual(expectedToken);
      expect(usersService.extractUserRoleNames).toHaveBeenCalledWith(mockUser);
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
    });

    it('should use default role when no roles exist', async () => {
      // Arrange
      const userWithoutRoles = { ...mockUser, userRoles: [] };
      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const expectedPayload: JwtPayload = {
        sub: userWithoutRoles.id,
        email: userWithoutRoles.email,
        role: 'USER',
        roles: [],
      };

      usersService.extractUserRoleNames.mockReturnValue([]);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.generateAccessToken(userWithoutRoles);

      // Assert
      expect(result).toEqual(expectedToken);
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
    });
  });

  describe('login', () => {
    it('should return auth response with token', async () => {
      // Arrange
      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      usersService.extractUserRoleNames.mockReturnValue(['ADMIN']);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toEqual({
        user: mockUser,
        accessToken: expectedToken,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user when valid', async () => {
      // Arrange
      const email = 'test@example.com';
      usersService.findUserByEmail.mockResolvedValue(mockUser);
      usersService.isUserValid.mockReturnValue(true);

      // Act
      const result = await service.validateUser(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(usersService.isUserValid).toHaveBeenCalledWith(mockUser);
    });

    it('should return null when user is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      usersService.findUserByEmail.mockResolvedValue(mockUser);
      usersService.isUserValid.mockReturnValue(false);

      // Act
      const result = await service.validateUser(email);

      // Assert
      expect(result).toBeNull();
      expect(usersService.isUserValid).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedRoles = ['ADMIN', 'USER'];
      rolesService.getUserRoles.mockResolvedValue(expectedRoles);

      // Act
      const result = await service.getUserRoles(userId);

      // Assert
      expect(result).toEqual(expectedRoles);
      expect(rolesService.getUserRoles).toHaveBeenCalledWith(userId);
    });
  });

  describe('userHasRole', () => {
    it('should return true when user has role', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const roleName = 'ADMIN';
      rolesService.hasUserRole.mockResolvedValue(true);

      // Act
      const result = await service.userHasRole(userId, roleName);

      // Assert
      expect(result).toBe(true);
      expect(rolesService.hasUserRole).toHaveBeenCalledWith(userId, roleName);
    });

    it('should return false when user does not have role', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const roleName = 'ADMIN';
      rolesService.hasUserRole.mockResolvedValue(false);

      // Act
      const result = await service.userHasRole(userId, roleName);

      // Assert
      expect(result).toBe(false);
      expect(rolesService.hasUserRole).toHaveBeenCalledWith(userId, roleName);
    });
  });

  describe('userHasAnyRole', () => {
    it('should return true when user has any of the roles', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const roleNames = ['ADMIN', 'SALES'];
      rolesService.hasUserAnyRole.mockResolvedValue(true);

      // Act
      const result = await service.userHasAnyRole(userId, roleNames);

      // Assert
      expect(result).toBe(true);
      expect(rolesService.hasUserAnyRole).toHaveBeenCalledWith(userId, roleNames);
    });

    it('should return false when user does not have any of the roles', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const roleNames = ['ADMIN', 'SALES'];
      rolesService.hasUserAnyRole.mockResolvedValue(false);

      // Act
      const result = await service.userHasAnyRole(userId, roleNames);

      // Assert
      expect(result).toBe(false);
      expect(rolesService.hasUserAnyRole).toHaveBeenCalledWith(userId, roleNames);
    });
  });
}); 
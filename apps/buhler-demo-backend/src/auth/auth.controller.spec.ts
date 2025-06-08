import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import type { UserWithRoles } from '../users/types/user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;

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

  const mockUserProfile = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    roles: ['ADMIN'],
    isActive: true,
    lastLoginAt: new Date('2024-01-01T00:00:00.000Z'),
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

    const mockUsersService = {
      convertToUserProfile: jest.fn(),
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      isUserValid: jest.fn(),
      extractUserRoleNames: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      // Arrange
      usersService.convertToUserProfile.mockReturnValue(mockUserProfile);

      // Act
      const result = await controller.getUserProfile(mockUser);

      // Assert
      expect(result).toEqual(mockUserProfile);
      expect(usersService.convertToUserProfile).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const expectedResponse = {
        message: 'Logout successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      };

      // Act
      const result = await controller.logoutUser(mockUser);

      // Assert
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user with roles', async () => {
      // Arrange
      authService.findUserById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.getCurrentUser(mockUser);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authService.findUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      authService.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getCurrentUser(mockUser)).rejects.toThrow('User not found');
      expect(authService.findUserById).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAdminOnlyContent', () => {
    it('should return admin-only content', async () => {
      // Arrange
      const mockDate = new Date('2024-01-01T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const expectedResponse = {
        message: 'This endpoint is only accessible to ADMIN users',
        timestamp: mockDate.toISOString(),
      };

      // Act
      const result = await controller.getAdminOnlyContent();

      // Assert
      expect(result).toEqual(expectedResponse);

      // Cleanup
      jest.restoreAllMocks();
    });
  });

  describe('getSalesDashboard', () => {
    it('should return sales dashboard data', async () => {
      // Arrange
      const expectedResponse = {
        message: 'Welcome to the Sales Dashboard - accessible to ADMIN and SALES users',
        data: {
          totalSales: 125000,
          activeDeals: 23,
          pipeline: 'Q1 targets on track',
        },
      };

      // Act
      const result = await controller.getSalesDashboard();

      // Assert
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getPublicInfo', () => {
    it('should return public information', async () => {
      // Arrange
      const expectedResponse = {
        message: 'This is a public endpoint - no authentication required',
        appName: 'explore.dg',
        version: '1.0.0',
      };

      // Act
      const result = await controller.getPublicInfo();

      // Assert
      expect(result).toEqual(expectedResponse);
    });
  });
}); 
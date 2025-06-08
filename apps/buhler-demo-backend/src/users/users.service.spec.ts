import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import type { UserWithRoles, CreateUserDto } from './types/user.interface';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

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

  const mockCreateUserDto: CreateUserDto = {
    email: 'new@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    displayName: 'Jane Smith',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(null),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserById', () => {
    it('should find user by id with roles', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);

      // Act
      const result = await service.findUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
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
        },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.findUserById(userId);

      // Assert
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
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
        },
      });
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email with roles', async () => {
      // Arrange
      const email = 'test@example.com';
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.findUserByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
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
        },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findUserByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create new user successfully', async () => {
      // Arrange
      const newUser = { ...mockUser, ...mockCreateUserDto };
      prismaService.user.create.mockResolvedValue(newUser as any);

      // Act
      const result = await service.createUser(mockCreateUserDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCreateUserDto.email,
          firstName: mockCreateUserDto.firstName,
          lastName: mockCreateUserDto.lastName,
          displayName: mockCreateUserDto.displayName,
          lastLoginAt: expect.any(Date),
        },
        include: {
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
        },
      });
    });
  });

  describe('updateUser', () => {
    it('should update existing user successfully', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { firstName: 'Updated Name' };
      const updatedUser = { ...mockUser, firstName: 'Updated Name' };
      prismaService.user.update.mockResolvedValue(updatedUser as any);

      // Act
      const result = await service.updateUser(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          ...updateData,
          lastLoginAt: expect.any(Date),
        },
        include: {
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
        },
      });
    });
  });

  describe('convertToUserProfile', () => {
    it('should convert UserWithRoles to UserProfile', () => {
      // Act
      const result = service.convertToUserProfile(mockUser);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        roles: ['ADMIN'],
        isActive: mockUser.isActive,
        lastLoginAt: mockUser.lastLoginAt,
      });
    });
  });

  describe('isUserValid', () => {
    it('should return true for valid active user', () => {
      // Act
      const result = service.isUserValid(mockUser);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for null user', () => {
      // Act
      const result = service.isUserValid(null);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for inactive user', () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };

      // Act
      const result = service.isUserValid(inactiveUser);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('extractUserRoleNames', () => {
    it('should extract role names from user roles', () => {
      // Act
      const result = service.extractUserRoleNames(mockUser);

      // Assert
      expect(result).toEqual(['ADMIN']);
    });

    it('should return empty array when no roles', () => {
      // Arrange
      const userWithoutRoles = { ...mockUser, userRoles: [] };

      // Act
      const result = service.extractUserRoleNames(userWithoutRoles);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle multiple roles', () => {
      // Arrange
      const userWithMultipleRoles = {
        ...mockUser,
        userRoles: [
          ...mockUser.userRoles,
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

      // Act
      const result = service.extractUserRoleNames(userWithMultipleRoles);

      // Assert
      expect(result).toEqual(['ADMIN', 'SALES']);
    });
  });
}); 
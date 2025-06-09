import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from './types/role.interface';

describe('RolesService', () => {
  let service: RolesService;
  let prismaService: any;

  const mockRole: Role = {
    id: 'role-id-123',
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Administrator role',
    isActive: true,
    isSystem: true,
    permissions: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUserRole = {
    id: 'user-role-123',
    userId: 'user-123',
    roleId: 'role-id-123',
    assignedBy: 'SYSTEM',
    isActive: true,
    expiresAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    role: {
      name: 'ADMIN',
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      role: {
        findMany: jest.fn(),
        createMany: jest.fn(),
      },
      userRole: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRoleIdsByNames', () => {
    it('should return existing role IDs', async () => {
      // Arrange
      const roleNames = ['ADMIN'];
      const existingRoles = [mockRole];
      prismaService.role.findMany.mockResolvedValue(existingRoles);
      prismaService.role.createMany.mockResolvedValue({ count: 0 });

      // Act
      const result = await service.getRoleIdsByNames(roleNames);

      // Assert
      expect(result).toEqual([mockRole.id]);
      expect(prismaService.role.findMany).toHaveBeenCalledWith({
        where: {
          name: { in: roleNames },
          isActive: true,
        },
      });
    });

    it('should create missing roles and return all IDs', async () => {
      // Arrange
      const roleNames = ['ADMIN', 'USER'];
      const existingRoles = [mockRole];
      const newRole = { ...mockRole, id: 'new-role-id', name: 'USER' };

      prismaService.role.findMany
        .mockResolvedValueOnce(existingRoles) // First call for existing roles
        .mockResolvedValueOnce([newRole]); // Second call for new roles

      prismaService.role.createMany.mockResolvedValue({ count: 1 });

      // Act
      const result = await service.getRoleIdsByNames(roleNames);

      // Assert
      expect(result).toEqual([mockRole.id, newRole.id]);
      expect(prismaService.role.createMany).toHaveBeenCalled();
    });

    it('should create roles with default display names for unknown roles', async () => {
      // Arrange
      const roleNames = ['UNKNOWN_ROLE'];
      const existingRoles: any[] = [];

      prismaService.role.findMany
        .mockResolvedValueOnce(existingRoles) // First call for existing roles
        .mockResolvedValueOnce([{ id: 'new-role-id', name: 'UNKNOWN_ROLE' }]); // Second call for new roles

      prismaService.role.createMany.mockResolvedValue({ count: 1 });

      // Act
      const result = await service.getRoleIdsByNames(roleNames);

      // Assert
      expect(prismaService.role.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: 'UNKNOWN_ROLE',
            displayName: 'UNKNOWN_ROLE',
            description: 'UNKNOWN_ROLE role',
            isSystem: true,
          },
        ],
        skipDuplicates: true,
      });
      expect(result).toEqual(['new-role-id']);
    });

    it('should handle multiple missing roles with known display names', async () => {
      // Arrange
      const roleNames = ['ADMIN', 'SALES', 'MODERATOR'];
      const existingRoles: any[] = [];

      prismaService.role.findMany
        .mockResolvedValueOnce(existingRoles) // First call for existing roles
        .mockResolvedValueOnce([
          { id: 'admin-id', name: 'ADMIN' },
          { id: 'sales-id', name: 'SALES' },
          { id: 'mod-id', name: 'MODERATOR' },
        ]); // Second call for new roles

      prismaService.role.createMany.mockResolvedValue({ count: 3 });

      // Act
      const result = await service.getRoleIdsByNames(roleNames);

      // Assert
      expect(prismaService.role.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: 'ADMIN',
            displayName: 'Administrator',
            description: 'Administrator role',
            isSystem: true,
          },
          {
            name: 'SALES',
            displayName: 'Sales Representative',
            description: 'Sales Representative role',
            isSystem: true,
          },
          {
            name: 'MODERATOR',
            displayName: 'Moderator',
            description: 'Moderator role',
            isSystem: true,
          },
        ],
        skipDuplicates: true,
      });
      expect(result).toEqual(['admin-id', 'sales-id', 'mod-id']);
    });
  });

  describe('assignRolesToUser', () => {
    it('should assign roles to user', async () => {
      // Arrange
      const userId = 'user-123';
      const roleIds = ['role-1', 'role-2'];
      prismaService.userRole.createMany.mockResolvedValue({ count: 2 });

      // Act
      await service.assignRolesToUser(userId, roleIds);

      // Assert
      expect(prismaService.userRole.createMany).toHaveBeenCalledWith({
        data: [
          {
            userId,
            roleId: 'role-1',
            assignedBy: 'SYSTEM',
          },
          {
            userId,
            roleId: 'role-2',
            assignedBy: 'SYSTEM',
          },
        ],
        skipDuplicates: true,
      });
    });
  });

  describe('getUserRoles', () => {
    it('should return user role names', async () => {
      // Arrange
      const userId = 'user-123';
      const userRoles = [mockUserRole];
      prismaService.userRole.findMany.mockResolvedValue(userRoles);

      // Act
      const result = await service.getUserRoles(userId);

      // Assert
      expect(result).toEqual(['ADMIN']);
      expect(prismaService.userRole.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: expect.any(Date) } },
          ],
        },
        include: {
          role: {
            select: { name: true },
          },
        },
      });
    });

    it('should return empty array when no roles found', async () => {
      // Arrange
      const userId = 'user-123';
      prismaService.userRole.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getUserRoles(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('hasUserRole', () => {
    it('should return true when user has role', async () => {
      // Arrange
      const userId = 'user-123';
      const roleName = 'ADMIN';
      jest.spyOn(service, 'getUserRoles').mockResolvedValue(['ADMIN', 'USER']);

      // Act
      const result = await service.hasUserRole(userId, roleName);

      // Assert
      expect(result).toBe(true);
      expect(service.getUserRoles).toHaveBeenCalledWith(userId);
    });

    it('should return false when user does not have role', async () => {
      // Arrange
      const userId = 'user-123';
      const roleName = 'ADMIN';
      jest.spyOn(service, 'getUserRoles').mockResolvedValue(['USER']);

      // Act
      const result = await service.hasUserRole(userId, roleName);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasUserAnyRole', () => {
    it('should return true when user has any of the roles', async () => {
      // Arrange
      const userId = 'user-123';
      const roleNames = ['ADMIN', 'SALES'];
      jest.spyOn(service, 'getUserRoles').mockResolvedValue(['ADMIN']);

      // Act
      const result = await service.hasUserAnyRole(userId, roleNames);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user has none of the roles', async () => {
      // Arrange
      const userId = 'user-123';
      const roleNames = ['ADMIN', 'SALES'];
      jest.spyOn(service, 'getUserRoles').mockResolvedValue(['USER']);

      // Act
      const result = await service.hasUserAnyRole(userId, roleNames);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('syncUserRoles', () => {
    it('should sync user roles by removing old and adding new', async () => {
      // Arrange
      const userId = 'user-123';
      const newRoleIds = ['role-1', 'role-2'];
      const currentRoleIds = ['role-old', 'role-1'];

      // Mock getCurrentSystemRoleIds
      prismaService.userRole.findMany.mockResolvedValue([
        { roleId: 'role-old' },
        { roleId: 'role-1' },
      ]);

      // Mock deactivateUserRoles
      prismaService.userRole.updateMany.mockResolvedValue({ count: 1 });

      // Mock assignRolesToUser
      prismaService.userRole.createMany.mockResolvedValue({ count: 1 });

      // Act
      await service.syncUserRoles(userId, newRoleIds);

      // Assert
      expect(prismaService.userRole.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          roleId: { in: ['role-old'] },
          assignedBy: 'SYSTEM',
        },
        data: { isActive: false },
      });

      expect(prismaService.userRole.createMany).toHaveBeenCalledWith({
        data: [
          {
            userId,
            roleId: 'role-2',
            assignedBy: 'SYSTEM',
          },
        ],
        skipDuplicates: true,
      });
    });

    it('should handle sync when no roles to remove', async () => {
      // Arrange
      const userId = 'user-123';
      const newRoleIds = ['role-1', 'role-2'];

      // Mock getCurrentSystemRoleIds - user already has role-1
      prismaService.userRole.findMany.mockResolvedValue([
        { roleId: 'role-1' },
      ]);

      // Mock assignRolesToUser
      prismaService.userRole.createMany.mockResolvedValue({ count: 1 });

      // Act
      await service.syncUserRoles(userId, newRoleIds);

      // Assert
      expect(prismaService.userRole.updateMany).not.toHaveBeenCalled();
      expect(prismaService.userRole.createMany).toHaveBeenCalledWith({
        data: [
          {
            userId,
            roleId: 'role-2',
            assignedBy: 'SYSTEM',
          },
        ],
        skipDuplicates: true,
      });
    });

    it('should handle sync when no roles to add', async () => {
      // Arrange
      const userId = 'user-123';
      const newRoleIds = ['role-1'];

      // Mock getCurrentSystemRoleIds - user has role-1 and role-old
      prismaService.userRole.findMany.mockResolvedValue([
        { roleId: 'role-1' },
        { roleId: 'role-old' },
      ]);

      // Mock deactivateUserRoles
      prismaService.userRole.updateMany.mockResolvedValue({ count: 1 });

      // Act
      await service.syncUserRoles(userId, newRoleIds);

      // Assert
      expect(prismaService.userRole.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          roleId: { in: ['role-old'] },
          assignedBy: 'SYSTEM',
        },
        data: { isActive: false },
      });
      expect(prismaService.userRole.createMany).not.toHaveBeenCalled();
    });

    it('should handle sync when no changes needed', async () => {
      // Arrange
      const userId = 'user-123';
      const newRoleIds = ['role-1', 'role-2'];

      // Mock getCurrentSystemRoleIds - user already has exact same roles
      prismaService.userRole.findMany.mockResolvedValue([
        { roleId: 'role-1' },
        { roleId: 'role-2' },
      ]);

      // Act
      await service.syncUserRoles(userId, newRoleIds);

      // Assert
      expect(prismaService.userRole.updateMany).not.toHaveBeenCalled();
      expect(prismaService.userRole.createMany).not.toHaveBeenCalled();
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MachineGroupService } from './machine-group.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineGroupDto } from './dto/create-machine-group.dto';
import { UpdateMachineGroupDto } from './dto/update-machine-group.dto';

describe('MachineGroupService', () => {
  let service: MachineGroupService;
  let prisma: PrismaService;

  const mockPrismaService = {
    machineGroup: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MachineGroupService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MachineGroupService>(MachineGroupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a machine group successfully', async () => {
      const createDto: CreateMachineGroupDto = {
        name: 'Test Group',
        description: 'Test Description',
      };
      const expectedResult = {
        id: '1',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        machines: [],
      };

      mockPrismaService.machineGroup.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(prisma.machineGroup.create).toHaveBeenCalledWith({
        data: createDto,
        include: { machines: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all active machine groups', async () => {
      const expectedResult = [
        {
          id: '1',
          name: 'Group 1',
          description: 'Desc 1',
          isActive: true,
          machines: [],
        },
        {
          id: '2',
          name: 'Group 2',
          description: 'Desc 2',
          isActive: true,
          machines: [],
        },
      ];

      mockPrismaService.machineGroup.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(prisma.machineGroup.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: { machines: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a machine group by id', async () => {
      const id = '1';
      const expectedResult = {
        id,
        name: 'Group 1',
        description: 'Desc 1',
        isActive: true,
        machines: [],
      };

      mockPrismaService.machineGroup.findFirst.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);

      expect(prisma.machineGroup.findFirst).toHaveBeenCalledWith({
        where: { id, isActive: true },
        include: { machines: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when machine group not found', async () => {
      const id = 'non-existent';

      mockPrismaService.machineGroup.findFirst.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(prisma.machineGroup.findFirst).toHaveBeenCalledWith({
        where: { id, isActive: true },
        include: { machines: true },
      });
    });
  });

  describe('update', () => {
    it('should update a machine group successfully', async () => {
      const id = '1';
      const updateDto: UpdateMachineGroupDto = {
        name: 'Updated Group',
      };
      const existingGroup = {
        id,
        name: 'Original Group',
        description: 'Original Desc',
        isActive: true,
        machines: [],
      };
      const updatedGroup = {
        ...existingGroup,
        ...updateDto,
      };

      mockPrismaService.machineGroup.findFirst.mockResolvedValue(existingGroup);
      mockPrismaService.machineGroup.update.mockResolvedValue(updatedGroup);

      const result = await service.update(id, updateDto);

      expect(prisma.machineGroup.findFirst).toHaveBeenCalledWith({
        where: { id, isActive: true },
        include: { machines: true },
      });
      expect(prisma.machineGroup.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
        include: { machines: true },
      });
      expect(result).toEqual(updatedGroup);
    });

    it('should throw NotFoundException when updating non-existent group', async () => {
      const id = 'non-existent';
      const updateDto: UpdateMachineGroupDto = {
        name: 'Updated Group',
      };

      mockPrismaService.machineGroup.findFirst.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a machine group', async () => {
      const id = '1';
      const existingGroup = {
        id,
        name: 'Group 1',
        description: 'Desc 1',
        isActive: true,
        machines: [],
      };

      mockPrismaService.machineGroup.findFirst.mockResolvedValue(existingGroup);
      mockPrismaService.machineGroup.update.mockResolvedValue({ ...existingGroup, isActive: false });

      await service.remove(id);

      expect(prisma.machineGroup.findFirst).toHaveBeenCalledWith({
        where: { id, isActive: true },
        include: { machines: true },
      });
      expect(prisma.machineGroup.update).toHaveBeenCalledWith({
        where: { id },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when removing non-existent group', async () => {
      const id = 'non-existent';

      mockPrismaService.machineGroup.findFirst.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
}); 
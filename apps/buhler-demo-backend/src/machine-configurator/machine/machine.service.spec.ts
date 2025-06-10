import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MachineService } from './machine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { 
  MachineWithBasicRelations, 
  MachineWithFullConfiguration 
} from '../types/prisma-types';

describe('MachineService', () => {
  let service: MachineService;
  let prismaService: {
    machine: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockMachineWithBasicRelations: MachineWithBasicRelations = {
    id: 'machine-1',
    name: 'Test Machine',
    description: 'Test Description',
    groupId: 'group-1',
    tags: ['test', 'machine'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    group: {
      id: 'group-1',
      name: 'Test Group',
      description: 'Test Group Description',
      color: '#FF0000',
      icon: 'test-icon',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    configurationTabs: [],
  };

  const mockMachineWithFullConfiguration: MachineWithFullConfiguration = {
    ...mockMachineWithBasicRelations,
    configurationTabs: [
      {
        id: 'tab-1',
        name: 'Test Tab',
        description: 'Test Tab Description',
        order: 1,
        machineId: 'machine-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        tabConfigurations: [],
      },
    ],
  };

  const mockCreateMachineDto: CreateMachineDto = {
    name: 'New Machine',
    description: 'New Machine Description',
    groupId: 'group-1',
    tags: ['new', 'test'],
  };

  const mockUpdateMachineDto: UpdateMachineDto = {
    name: 'Updated Machine',
    description: 'Updated Description',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      machine: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MachineService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MachineService>(MachineService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a machine successfully', async () => {
      prismaService.machine.create.mockResolvedValue(mockMachineWithBasicRelations);

      const result = await service.create(mockCreateMachineDto);

      expect(prismaService.machine.create).toHaveBeenCalledWith({
        data: mockCreateMachineDto,
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(mockMachineWithBasicRelations);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Database error');
      prismaService.machine.create.mockRejectedValue(error);

      await expect(service.create(mockCreateMachineDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all active machines without filters', async () => {
      const expectedMachines = [mockMachineWithBasicRelations];
      prismaService.machine.findMany.mockResolvedValue(expectedMachines);

      const result = await service.findAll();

      expect(prismaService.machine.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(expectedMachines);
    });

    it('should filter machines by groupId', async () => {
      const expectedMachines = [mockMachineWithBasicRelations];
      prismaService.machine.findMany.mockResolvedValue(expectedMachines);

      const result = await service.findAll({ groupId: 'group-1' });

      expect(prismaService.machine.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          groupId: 'group-1',
        },
        orderBy: { name: 'asc' },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(expectedMachines);
    });

    it('should filter machines by tags', async () => {
      const expectedMachines = [mockMachineWithBasicRelations];
      prismaService.machine.findMany.mockResolvedValue(expectedMachines);

      const result = await service.findAll({ tags: ['test', 'machine'] });

      expect(prismaService.machine.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          tags: {
            hasSome: ['test', 'machine'],
          },
        },
        orderBy: { name: 'asc' },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(expectedMachines);
    });

    it('should filter machines by both groupId and tags', async () => {
      const expectedMachines = [mockMachineWithBasicRelations];
      prismaService.machine.findMany.mockResolvedValue(expectedMachines);

      const result = await service.findAll({ 
        groupId: 'group-1', 
        tags: ['test'] 
      });

      expect(prismaService.machine.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          groupId: 'group-1',
          tags: {
            hasSome: ['test'],
          },
        },
        orderBy: { name: 'asc' },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(expectedMachines);
    });

    it('should handle empty tags array', async () => {
      const expectedMachines = [mockMachineWithBasicRelations];
      prismaService.machine.findMany.mockResolvedValue(expectedMachines);

      const result = await service.findAll({ tags: [] });

      expect(prismaService.machine.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(expectedMachines);
    });
  });

  describe('findOne', () => {
    it('should find a machine by id', async () => {
      prismaService.machine.findFirst.mockResolvedValue(mockMachineWithBasicRelations);

      const result = await service.findOne('machine-1');

      expect(prismaService.machine.findFirst).toHaveBeenCalledWith({
        where: { id: 'machine-1', isActive: true },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(mockMachineWithBasicRelations);
    });

    it('should throw NotFoundException when machine not found', async () => {
      prismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Machine with ID non-existent not found')
      );
    });
  });

  describe('getMachineWithConfiguration', () => {
    it('should get machine with full configuration', async () => {
      prismaService.machine.findFirst.mockResolvedValue(mockMachineWithFullConfiguration);

      const result = await service.getMachineWithConfiguration('machine-1');

      expect(prismaService.machine.findFirst).toHaveBeenCalledWith({
        where: { id: 'machine-1', isActive: true },
        include: {
          group: true,
          configurationTabs: {
            include: {
              tabConfigurations: {
                include: {
                  configuration: {
                    include: {
                      options: true,
                      validationRules: true,
                      parentDependencies: true,
                      childDependencies: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockMachineWithFullConfiguration);
    });

    it('should throw NotFoundException when machine not found', async () => {
      prismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.getMachineWithConfiguration('non-existent')).rejects.toThrow(
        new NotFoundException('Machine with ID non-existent not found')
      );
    });
  });

  describe('update', () => {
    it('should update a machine successfully', async () => {
      const updatedMachine = { 
        ...mockMachineWithBasicRelations, 
        ...mockUpdateMachineDto 
      };
      
      prismaService.machine.findFirst.mockResolvedValue(mockMachineWithBasicRelations);
      prismaService.machine.update.mockResolvedValue(updatedMachine);

      const result = await service.update('machine-1', mockUpdateMachineDto);

      expect(prismaService.machine.findFirst).toHaveBeenCalledWith({
        where: { id: 'machine-1', isActive: true },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(prismaService.machine.update).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
        data: mockUpdateMachineDto,
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(result).toEqual(updatedMachine);
    });

    it('should throw NotFoundException when machine not found', async () => {
      prismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.update('non-existent', mockUpdateMachineDto)).rejects.toThrow(
        new NotFoundException('Machine with ID non-existent not found')
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a machine successfully', async () => {
      prismaService.machine.findFirst.mockResolvedValue(mockMachineWithBasicRelations);
      prismaService.machine.update.mockResolvedValue({
        ...mockMachineWithBasicRelations,
        isActive: false,
      });

      await service.remove('machine-1');

      expect(prismaService.machine.findFirst).toHaveBeenCalledWith({
        where: { id: 'machine-1', isActive: true },
        include: {
          group: true,
          configurationTabs: true,
        },
      });
      expect(prismaService.machine.update).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when machine not found', async () => {
      prismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        new NotFoundException('Machine with ID non-existent not found')
      );
    });
  });
}); 
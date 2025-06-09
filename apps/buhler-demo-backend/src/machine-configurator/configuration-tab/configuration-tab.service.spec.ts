import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigurationTabService } from './configuration-tab.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigurationTabDto } from './dto/create-configuration-tab.dto';
import { UpdateConfigurationTabDto } from './dto/update-configuration-tab.dto';
import { ConfigurationTabWithConfigurations } from '../types/prisma-types';

describe('ConfigurationTabService', () => {
  let service: ConfigurationTabService;
  let prismaService: any;

  const mockMachine = {
    id: 'machine-1',
    name: 'Test Machine',
    isActive: true,
  };

  const mockConfigurationTab: ConfigurationTabWithConfigurations = {
    id: 'tab-1',
    name: 'Test Tab',
    description: 'Test Description',
    order: 1,
    machineId: 'machine-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    machine: mockMachine,
    tabConfigurations: [],
  };

  const mockTabConfiguration = {
    id: 'tab-config-1',
    tabId: 'tab-1',
    configurationId: 'config-1',
    order: 1,
    isVisible: true,
    isRequired: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    configuration: {
      id: 'config-1',
      name: 'Test Configuration',
      description: 'Test Description',
      helpText: 'Test Help',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [
        {
          id: 'option-1',
          configurationId: 'config-1',
          displayName: 'Option 1',
          value: 'option1',
          description: 'First option',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      validationRules: [],
      parentDependencies: [],
      childDependencies: [],
    },
  };

  const mockCreateDto: CreateConfigurationTabDto = {
    machineId: 'machine-1',
    name: 'New Tab',
    description: 'New Tab Description',
    order: 2,
  };

  const mockUpdateDto: UpdateConfigurationTabDto = {
    name: 'Updated Tab',
    description: 'Updated Description',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      machine: {
        findFirst: jest.fn(),
      },
      configurationTab: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      tabConfiguration: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationTabService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConfigurationTabService>(ConfigurationTabService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a configuration tab successfully with auto-generated order', async () => {
      const maxOrderResult = { order: 3 };
      const expectedTab = { ...mockConfigurationTab, order: 4 };

      prismaService.machine.findFirst.mockResolvedValue(mockMachine);
      prismaService.configurationTab.findFirst.mockResolvedValue(maxOrderResult);
      prismaService.configurationTab.create.mockResolvedValue(expectedTab);

      const createDtoWithoutOrder = { ...mockCreateDto };
      delete createDtoWithoutOrder.order;

      const result = await service.create(createDtoWithoutOrder);

      expect(prismaService.machine.findFirst).toHaveBeenCalledWith({
        where: { id: 'machine-1', isActive: true },
      });
      expect(prismaService.configurationTab.findFirst).toHaveBeenCalledWith({
        where: { machineId: 'machine-1' },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      expect(prismaService.configurationTab.create).toHaveBeenCalledWith({
        data: { ...createDtoWithoutOrder, order: 4 },
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(expectedTab);
    });

    it('should create a configuration tab with specified order', async () => {
      prismaService.machine.findFirst.mockResolvedValue(mockMachine);
      prismaService.configurationTab.findFirst.mockResolvedValue(null);
      prismaService.configurationTab.create.mockResolvedValue(mockConfigurationTab);

      const result = await service.create(mockCreateDto);

      expect(prismaService.configurationTab.create).toHaveBeenCalledWith({
        data: mockCreateDto,
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockConfigurationTab);
    });

    it('should create a configuration tab with order 1 when no existing tabs', async () => {
      const expectedTab = { ...mockConfigurationTab, order: 1 };

      prismaService.machine.findFirst.mockResolvedValue(mockMachine);
      prismaService.configurationTab.findFirst.mockResolvedValue(null);
      prismaService.configurationTab.create.mockResolvedValue(expectedTab);

      const createDtoWithoutOrder = { ...mockCreateDto };
      delete createDtoWithoutOrder.order;

      const result = await service.create(createDtoWithoutOrder);

      expect(prismaService.configurationTab.create).toHaveBeenCalledWith({
        data: { ...createDtoWithoutOrder, order: 1 },
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(expectedTab);
    });

    it('should throw BadRequestException when machine not found', async () => {
      prismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        new BadRequestException('Machine with ID machine-1 not found')
      );

      expect(prismaService.configurationTab.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all active configuration tabs without filters', async () => {
      const expectedTabs = [mockConfigurationTab];
      prismaService.configurationTab.findMany.mockResolvedValue(expectedTabs);

      const result = await service.findAll();

      expect(prismaService.configurationTab.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [
          { machineId: 'asc' },
          { order: 'asc' },
        ],
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(expectedTabs);
    });

    it('should filter configuration tabs by machineId', async () => {
      const expectedTabs = [mockConfigurationTab];
      prismaService.configurationTab.findMany.mockResolvedValue(expectedTabs);

      const result = await service.findAll({ machineId: 'machine-1' });

      expect(prismaService.configurationTab.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          machineId: 'machine-1',
        },
        orderBy: [
          { machineId: 'asc' },
          { order: 'asc' },
        ],
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(expectedTabs);
    });
  });

  describe('findOne', () => {
    it('should find a configuration tab by id', async () => {
      prismaService.configurationTab.findFirst.mockResolvedValue(mockConfigurationTab);

      const result = await service.findOne('tab-1');

      expect(prismaService.configurationTab.findFirst).toHaveBeenCalledWith({
        where: { id: 'tab-1', isActive: true },
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockConfigurationTab);
    });

    it('should throw NotFoundException when configuration tab not found', async () => {
      prismaService.configurationTab.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Configuration tab with ID non-existent not found')
      );
    });
  });

  describe('getTabConfigurations', () => {
    it('should get tab with its configurations', async () => {
      const expectedTabConfigurations = [mockTabConfiguration];

      prismaService.configurationTab.findFirst.mockResolvedValue(mockConfigurationTab);
      prismaService.tabConfiguration.findMany.mockResolvedValue(expectedTabConfigurations);

      const result = await service.getTabConfigurations('tab-1');

      expect(prismaService.tabConfiguration.findMany).toHaveBeenCalledWith({
        where: { 
          tabId: 'tab-1',
          isVisible: true,
        },
        orderBy: { order: 'asc' },
        include: {
          configuration: {
            include: {
              options: {
                where: { isActive: true },
                orderBy: { displayName: 'asc' },
              },
              validationRules: {
                where: { isActive: true },
              },
              parentDependencies: {
                include: {
                  parentConfiguration: {
                    include: { options: true },
                  },
                },
              },
              childDependencies: {
                include: {
                  childConfiguration: {
                    include: { options: true },
                  },
                },
              },
            },
          },
        },
      });

      expect(result).toEqual({
        tab: mockConfigurationTab,
        configurations: expectedTabConfigurations,
      });
    });

    it('should throw NotFoundException when tab not found', async () => {
      prismaService.configurationTab.findFirst.mockResolvedValue(null);

      await expect(service.getTabConfigurations('non-existent')).rejects.toThrow(
        new NotFoundException('Configuration tab with ID non-existent not found')
      );
    });
  });

  describe('update', () => {
    it('should update a configuration tab successfully', async () => {
      const updatedTab = { ...mockConfigurationTab, ...mockUpdateDto };
      
      prismaService.configurationTab.findFirst.mockResolvedValue(mockConfigurationTab);
      prismaService.configurationTab.update.mockResolvedValue(updatedTab);

      const result = await service.update('tab-1', mockUpdateDto);

      expect(prismaService.configurationTab.findFirst).toHaveBeenCalledWith({
        where: { id: 'tab-1', isActive: true },
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(prismaService.configurationTab.update).toHaveBeenCalledWith({
        where: { id: 'tab-1' },
        data: mockUpdateDto,
        include: {
          machine: true,
          tabConfigurations: {
            include: {
              configuration: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(updatedTab);
    });

    it('should throw NotFoundException when configuration tab not found', async () => {
      prismaService.configurationTab.findFirst.mockResolvedValue(null);

      await expect(service.update('non-existent', mockUpdateDto)).rejects.toThrow(
        new NotFoundException('Configuration tab with ID non-existent not found')
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a configuration tab when it has no configurations', async () => {
      prismaService.configurationTab.findFirst.mockResolvedValue(mockConfigurationTab);
      prismaService.tabConfiguration.count.mockResolvedValue(0);
      prismaService.configurationTab.update.mockResolvedValue({
        ...mockConfigurationTab,
        isActive: false,
      });

      await service.remove('tab-1');

      expect(prismaService.tabConfiguration.count).toHaveBeenCalledWith({
        where: { tabId: 'tab-1' },
      });
      expect(prismaService.configurationTab.update).toHaveBeenCalledWith({
        where: { id: 'tab-1' },
        data: { isActive: false },
      });
    });

    it('should throw BadRequestException when tab has configurations', async () => {
      prismaService.configurationTab.findFirst.mockResolvedValue(mockConfigurationTab);
      prismaService.tabConfiguration.count.mockResolvedValue(3);

      await expect(service.remove('tab-1')).rejects.toThrow(
        new BadRequestException(
          "Cannot delete configuration tab 'tab-1' as it still has 3 configuration(s). Remove all configurations first."
        )
      );

      expect(prismaService.configurationTab.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when configuration tab not found', async () => {
      prismaService.configurationTab.findFirst.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        new NotFoundException('Configuration tab with ID non-existent not found')
      );
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ConfigurationTabController } from './configuration-tab.controller';
import { ConfigurationTabService } from './configuration-tab.service';
import { CreateConfigurationTabDto } from './dto/create-configuration-tab.dto';
import { UpdateConfigurationTabDto } from './dto/update-configuration-tab.dto';

describe('ConfigurationTabController', () => {
  let controller: ConfigurationTabController;
  let service: ConfigurationTabService;

  const mockConfigurationTabService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getTabConfigurations: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationTabController],
      providers: [
        {
          provide: ConfigurationTabService,
          useValue: mockConfigurationTabService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ConfigurationTabController>(ConfigurationTabController);
    service = module.get<ConfigurationTabService>(ConfigurationTabService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a configuration tab', async () => {
      const createDto: CreateConfigurationTabDto = {
        name: 'Test Tab',
        description: 'Test Description',
        machineId: 'machine-1',
        order: 1,
      };
      const expectedResult = { 
        id: '1', 
        ...createDto, 
        tabConfigurations: [] 
      };

      mockConfigurationTabService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all configuration tabs', async () => {
      const expectedResult = [
        { 
          id: '1', 
          name: 'Tab 1', 
          machineId: 'machine-1',
          order: 1,
          tabConfigurations: []
        },
        { 
          id: '2', 
          name: 'Tab 2', 
          machineId: 'machine-1',
          order: 2,
          tabConfigurations: []
        },
      ];

      mockConfigurationTabService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
    });

    it('should filter tabs by machineId', async () => {
      const machineId = 'machine-1';
      const expectedResult = [
        { 
          id: '1', 
          name: 'Tab 1', 
          machineId: 'machine-1',
          order: 1,
          tabConfigurations: []
        },
      ];

      mockConfigurationTabService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(machineId);

      expect(service.findAll).toHaveBeenCalledWith({ machineId });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a configuration tab by id', async () => {
      const id = '1';
      const expectedResult = { 
        id, 
        name: 'Tab 1', 
        machineId: 'machine-1',
        order: 1,
        tabConfigurations: []
      };

      mockConfigurationTabService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTabConfigurations', () => {
    it('should return tab with configurations', async () => {
      const id = '1';
      const expectedResult = {
        tab: { 
          id, 
          name: 'Tab 1', 
          machineId: 'machine-1',
          tabConfigurations: []
        },
        configurations: [
          {
            id: 'tc-1',
            order: 1,
            configuration: {
              id: 'config-1',
              name: 'Config 1',
              type: 'SINGLE_CHOICE',
              options: []
            }
          }
        ]
      };

      mockConfigurationTabService.getTabConfigurations.mockResolvedValue(expectedResult);

      const result = await controller.getTabConfigurations(id);

      expect(service.getTabConfigurations).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a configuration tab', async () => {
      const id = '1';
      const updateDto: UpdateConfigurationTabDto = {
        name: 'Updated Tab',
      };
      const expectedResult = { 
        id, 
        name: 'Updated Tab', 
        machineId: 'machine-1',
        order: 1,
        tabConfigurations: []
      };

      mockConfigurationTabService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a configuration tab', async () => {
      const id = '1';

      mockConfigurationTabService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('Guards and Roles', () => {
    it('should have JwtAuthGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', ConfigurationTabController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have RolesGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', ConfigurationTabController);
      expect(guards).toContain(RolesGuard);
    });

    it('should restrict create to ADMIN only', () => {
      const roles = Reflect.getMetadata('roles', controller.create);
      expect(roles).toEqual(['ADMIN']);
    });

    it('should allow all authenticated users for read operations', () => {
      const findAllRoles = Reflect.getMetadata('roles', controller.findAll);
      expect(findAllRoles).toEqual(['ADMIN', 'SALES', 'USER']);

      const findOneRoles = Reflect.getMetadata('roles', controller.findOne);
      expect(findOneRoles).toEqual(['ADMIN', 'SALES', 'USER']);

      const configRoles = Reflect.getMetadata('roles', controller.getTabConfigurations);
      expect(configRoles).toEqual(['ADMIN', 'SALES', 'USER']);
    });

    it('should restrict update and delete to ADMIN only', () => {
      const updateRoles = Reflect.getMetadata('roles', controller.update);
      expect(updateRoles).toEqual(['ADMIN']);

      const removeRoles = Reflect.getMetadata('roles', controller.remove);
      expect(removeRoles).toEqual(['ADMIN']);
    });
  });
}); 
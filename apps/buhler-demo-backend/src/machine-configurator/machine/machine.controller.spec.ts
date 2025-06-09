import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { MachineController } from './machine.controller';
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

describe('MachineController', () => {
  let controller: MachineController;
  let service: MachineService;

  const mockMachineService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getMachineWithConfiguration: jest.fn(),
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
      controllers: [MachineController],
      providers: [
        {
          provide: MachineService,
          useValue: mockMachineService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<MachineController>(MachineController);
    service = module.get<MachineService>(MachineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a machine', async () => {
      const createDto: CreateMachineDto = {
        name: 'Test Machine',
        description: 'Test Description',
        groupId: 'group-1',
        tags: ['tag1', 'tag2'],
      };
      const expectedResult = { 
        id: '1', 
        ...createDto, 
        group: { id: 'group-1', name: 'Test Group' },
        configurationTabs: []
      };

      mockMachineService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all machines', async () => {
      const expectedResult = [
        { 
          id: '1', 
          name: 'Machine 1', 
          groupId: 'group-1',
          group: { id: 'group-1', name: 'Group 1' }
        },
        { 
          id: '2', 
          name: 'Machine 2', 
          groupId: 'group-2',
          group: { id: 'group-2', name: 'Group 2' }
        },
      ];

      mockMachineService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
    });

    it('should filter machines by groupId', async () => {
      const groupId = 'group-1';
      const expectedResult = [
        { 
          id: '1', 
          name: 'Machine 1', 
          groupId: 'group-1',
          group: { id: 'group-1', name: 'Group 1' }
        },
      ];

      mockMachineService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(groupId);

      expect(service.findAll).toHaveBeenCalledWith({ groupId, tags: undefined });
      expect(result).toEqual(expectedResult);
    });

    it('should filter machines by tags', async () => {
      const tags = 'tag1,tag2';
      const expectedResult = [
        { 
          id: '1', 
          name: 'Machine 1', 
          tags: ['tag1', 'tag2'],
          group: { id: 'group-1', name: 'Group 1' }
        },
      ];

      mockMachineService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, tags);

      expect(service.findAll).toHaveBeenCalledWith({ 
        groupId: undefined, 
        tags: ['tag1', 'tag2'] 
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a machine by id', async () => {
      const id = '1';
      const expectedResult = { 
        id, 
        name: 'Machine 1', 
        groupId: 'group-1',
        group: { id: 'group-1', name: 'Group 1' },
        configurationTabs: []
      };

      mockMachineService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMachineConfiguration', () => {
    it('should return machine with full configuration', async () => {
      const id = '1';
      const expectedResult = { 
        id, 
        name: 'Machine 1', 
        group: { id: 'group-1', name: 'Group 1' },
        configurationTabs: [
          {
            id: 'tab-1',
            name: 'Tab 1',
            order: 1,
            tabConfigurations: [
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
          }
        ]
      };

      mockMachineService.getMachineWithConfiguration.mockResolvedValue(expectedResult);

      const result = await controller.getMachineConfiguration(id);

      expect(service.getMachineWithConfiguration).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a machine', async () => {
      const id = '1';
      const updateDto: UpdateMachineDto = {
        name: 'Updated Machine',
      };
      const expectedResult = { 
        id, 
        name: 'Updated Machine', 
        groupId: 'group-1',
        group: { id: 'group-1', name: 'Group 1' },
        configurationTabs: []
      };

      mockMachineService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a machine', async () => {
      const id = '1';

      mockMachineService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('Guards and Roles', () => {
    it('should have JwtAuthGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', MachineController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have RolesGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', MachineController);
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

      const configRoles = Reflect.getMetadata('roles', controller.getMachineConfiguration);
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
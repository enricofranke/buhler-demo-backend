import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { MachineGroupController } from './machine-group.controller';
import { MachineGroupService } from './machine-group.service';
import { CreateMachineGroupDto } from './dto/create-machine-group.dto';
import { UpdateMachineGroupDto } from './dto/update-machine-group.dto';

describe('MachineGroupController', () => {
  let controller: MachineGroupController;
  let service: MachineGroupService;

  const mockMachineGroupService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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
      controllers: [MachineGroupController],
      providers: [
        {
          provide: MachineGroupService,
          useValue: mockMachineGroupService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<MachineGroupController>(MachineGroupController);
    service = module.get<MachineGroupService>(MachineGroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a machine group', async () => {
      const createDto: CreateMachineGroupDto = {
        name: 'Test Group',
        description: 'Test Description',
      };
      const expectedResult = { id: '1', ...createDto, machines: [] };

      mockMachineGroupService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all machine groups', async () => {
      const expectedResult = [
        { id: '1', name: 'Group 1', description: 'Desc 1', machines: [] },
        { id: '2', name: 'Group 2', description: 'Desc 2', machines: [] },
      ];

      mockMachineGroupService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a machine group by id', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Group 1', description: 'Desc 1', machines: [] };

      mockMachineGroupService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a machine group', async () => {
      const id = '1';
      const updateDto: UpdateMachineGroupDto = {
        name: 'Updated Group',
      };
      const expectedResult = { id, name: 'Updated Group', description: 'Desc 1', machines: [] };

      mockMachineGroupService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a machine group', async () => {
      const id = '1';

      mockMachineGroupService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('Guards', () => {
    it('should have JwtAuthGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', MachineGroupController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have RolesGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', MachineGroupController);
      expect(guards).toContain(RolesGuard);
    });
  });
});
 
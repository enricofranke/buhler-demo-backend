import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ValidateConfigurationDto } from './dto/validate-configuration.dto';
import { ConfigurationType } from './enums/configuration-type.enum';

describe('ConfigurationController', () => {
  let controller: ConfigurationController;
  let service: ConfigurationService;

  const mockConfigurationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getDependencies: jest.fn(),
    validateConfiguration: jest.fn(),
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
      controllers: [ConfigurationController],
      providers: [
        {
          provide: ConfigurationService,
          useValue: mockConfigurationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ConfigurationController>(ConfigurationController);
    service = module.get<ConfigurationService>(ConfigurationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a configuration', async () => {
      const createDto: CreateConfigurationDto = {
        name: 'Test Config',
        description: 'Test Description',
        type: 'SINGLE_CHOICE' as ConfigurationType,
        isRequired: true,
        isReusable: true,
      };
      const expectedResult = { id: '1', ...createDto, options: [], validationRules: [] };

      mockConfigurationService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all configurations', async () => {
      const expectedResult = [
        { id: '1', name: 'Config 1', type: ConfigurationType.SINGLE_CHOICE, options: [] },
        { id: '2', name: 'Config 2', type: ConfigurationType.BOOLEAN, options: [] },
      ];

      mockConfigurationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
    });

    it('should filter configurations by type', async () => {
      const type = ConfigurationType.SINGLE_CHOICE;
      const expectedResult = [
        { id: '1', name: 'Config 1', type: ConfigurationType.SINGLE_CHOICE, options: [] },
      ];

      mockConfigurationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(type);

      expect(service.findAll).toHaveBeenCalledWith({ type });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a configuration by id', async () => {
      const id = '1';
      const expectedResult = { 
        id, 
        name: 'Config 1', 
        type: ConfigurationType.SINGLE_CHOICE, 
        options: [],
        validationRules: []
      };

      mockConfigurationService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getDependencies', () => {
    it('should return configuration dependencies', async () => {
      const id = '1';
      const expectedResult = {
        parentDependencies: [],
        childDependencies: [
          {
            id: 'dep1',
            parentConfigurationId: '1',
            childConfigurationId: '2',
            condition: 'value == "option1"',
            action: 'SHOW',
            childConfiguration: { id: '2', name: 'Child Config', options: [] }
          }
        ]
      };

      mockConfigurationService.getDependencies.mockResolvedValue(expectedResult);

      const result = await controller.getDependencies(id);

      expect(service.getDependencies).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validate', () => {
    it('should validate configuration successfully', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: '1',
        value: 'test-value',
      };
      const expectedResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      mockConfigurationService.validateConfiguration.mockResolvedValue(expectedResult);

      const result = await controller.validate(validateDto);

      expect(service.validateConfiguration).toHaveBeenCalledWith(validateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return validation errors', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: '1',
        value: '',
      };
      const expectedResult = {
        isValid: false,
        errors: ['Configuration is required'],
        warnings: [],
      };

      mockConfigurationService.validateConfiguration.mockResolvedValue(expectedResult);

      const result = await controller.validate(validateDto);

      expect(service.validateConfiguration).toHaveBeenCalledWith(validateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a configuration', async () => {
      const id = '1';
      const updateDto: UpdateConfigurationDto = {
        name: 'Updated Config',
      };
      const expectedResult = { 
        id, 
        name: 'Updated Config', 
        type: ConfigurationType.SINGLE_CHOICE,
        options: [],
        validationRules: []
      };

      mockConfigurationService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a configuration', async () => {
      const id = '1';

      mockConfigurationService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('Guards and Roles', () => {
    it('should have JwtAuthGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', ConfigurationController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have RolesGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', ConfigurationController);
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
    });

    it('should restrict validate to ADMIN and SALES only', () => {
      const roles = Reflect.getMetadata('roles', controller.validate);
      expect(roles).toEqual(['ADMIN', 'SALES']);
    });

    it('should restrict update and delete to ADMIN only', () => {
      const updateRoles = Reflect.getMetadata('roles', controller.update);
      expect(updateRoles).toEqual(['ADMIN']);

      const removeRoles = Reflect.getMetadata('roles', controller.remove);
      expect(removeRoles).toEqual(['ADMIN']);
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ValidateConfigurationDto } from './dto/validate-configuration.dto';
import { ConfigurationType } from './enums/configuration-type.enum';
import { ConfigurationWithOptions } from '../types/prisma-types';
import { Decimal } from '@prisma/client/runtime/library';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let prismaService: any;

  const mockConfiguration: ConfigurationWithOptions = {
    id: 'config-1',
    name: 'Test Configuration',
    description: 'Test Description',
    helpText: 'Test Help',
    type: ConfigurationType.SINGLE_CHOICE,
    isRequired: true,
    aiLogicHint: 'Test AI hint',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [
      {
        id: 'option-1',
        configurationId: 'config-1',
        label: 'Option 1',
        value: 'option1',
        description: 'First option',
        isDefault: true,
        order: 1,
        priceModifier: new Decimal(0),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'option-2',
        configurationId: 'config-1',
        label: 'Option 2',
        value: 'option2',
        description: 'Second option',
        isDefault: false,
        order: 2,
        priceModifier: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    validationRules: [
      {
        id: 'rule-1',
        configurationId: 'config-1',
        ruleType: 'MIN_VALUE',
        ruleValue: '5',
        errorMessage: 'Value must be at least 5',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    parentDependencies: [],
    childDependencies: [],
  };

  const mockCreateDto: CreateConfigurationDto = {
    name: 'New Configuration',
    description: 'New Description',
    helpText: 'New Help',
    type: ConfigurationType.TEXT,
    isRequired: false,
    aiLogicHint: 'New AI hint',
  };

  const mockUpdateDto: UpdateConfigurationDto = {
    name: 'Updated Configuration',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      configuration: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      configurationDependency: {
        findMany: jest.fn(),
      },
      tabConfiguration: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConfigurationService>(ConfigurationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a configuration successfully', async () => {
      prismaService.configuration.create.mockResolvedValue(mockConfiguration);

      const result = await service.create(mockCreateDto);

      expect(prismaService.configuration.create).toHaveBeenCalledWith({
        data: mockCreateDto,
        include: {
          options: true,
          validationRules: true,
          parentDependencies: true,
          childDependencies: true,
        },
      });
      expect(result).toEqual(mockConfiguration);
    });
  });

  describe('findAll', () => {
    it('should return all active configurations without filters', async () => {
      const expectedConfigurations = [mockConfiguration];
      prismaService.configuration.findMany.mockResolvedValue(expectedConfigurations);

      const result = await service.findAll();

      expect(prismaService.configuration.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: {
          options: true,
          validationRules: true,
          parentDependencies: true,
          childDependencies: true,
        },
      });
      expect(result).toEqual(expectedConfigurations);
    });

    it('should filter configurations by type', async () => {
      const expectedConfigurations = [mockConfiguration];
      prismaService.configuration.findMany.mockResolvedValue(expectedConfigurations);

      const result = await service.findAll({ type: ConfigurationType.SINGLE_CHOICE });

      expect(prismaService.configuration.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          type: ConfigurationType.SINGLE_CHOICE,
        },
        orderBy: { name: 'asc' },
        include: {
          options: true,
          validationRules: true,
          parentDependencies: true,
          childDependencies: true,
        },
      });
      expect(result).toEqual(expectedConfigurations);
    });
  });

  describe('findOne', () => {
    it('should find a configuration by id', async () => {
      prismaService.configuration.findFirst.mockResolvedValue(mockConfiguration);

      const result = await service.findOne('config-1');

      expect(prismaService.configuration.findFirst).toHaveBeenCalledWith({
        where: { id: 'config-1', isActive: true },
        include: {
          options: true,
          validationRules: true,
          parentDependencies: true,
          childDependencies: true,
        },
      });
      expect(result).toEqual(mockConfiguration);
    });

    it('should throw NotFoundException when configuration not found', async () => {
      prismaService.configuration.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Configuration with ID non-existent not found')
      );
    });
  });

  describe('getDependencies', () => {
    it('should get parent and child dependencies', async () => {
      const mockParentDependencies = [
        {
          id: 'dep-1',
          parentConfigurationId: 'parent-1',
          childConfigurationId: 'config-1',
          parentConfiguration: { id: 'parent-1', options: [] },
        }
      ];
      const mockChildDependencies = [
        {
          id: 'dep-2',
          parentConfigurationId: 'config-1',
          childConfigurationId: 'child-1',
          childConfiguration: { id: 'child-1', options: [] },
        }
      ];

      prismaService.configuration.findFirst.mockResolvedValue(mockConfiguration);
      prismaService.configurationDependency.findMany
        .mockResolvedValueOnce(mockParentDependencies)
        .mockResolvedValueOnce(mockChildDependencies);

      const result = await service.getDependencies('config-1');

      expect(prismaService.configurationDependency.findMany).toHaveBeenCalledWith({
        where: { childConfigurationId: 'config-1' },
        include: {
          parentConfiguration: {
            include: { options: true },
          },
        },
      });

      expect(prismaService.configurationDependency.findMany).toHaveBeenCalledWith({
        where: { parentConfigurationId: 'config-1' },
        include: {
          childConfiguration: {
            include: { options: true },
          },
        },
      });

      expect(result).toEqual({
        parentDependencies: mockParentDependencies,
        childDependencies: mockChildDependencies,
      });
    });
  });

  describe('validateConfiguration', () => {
    beforeEach(() => {
      prismaService.configuration.findFirst.mockResolvedValue(mockConfiguration);
    });

    it('should validate required field with value', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'option1',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for required field without value', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: '',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Configuration 'Test Configuration' is required");
    });

    it('should fail validation for required field with null value', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: null as any,
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Configuration 'Test Configuration' is required");
    });

    it('should fail validation for required field with undefined value', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: undefined,
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Configuration 'Test Configuration' is required");
    });

    it('should validate MIN_VALUE rule successfully', async () => {
      const configWithMinValue = {
        ...mockConfiguration,
        type: ConfigurationType.NUMBER,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'MIN_VALUE',
            ruleValue: '5',
            errorMessage: 'Value must be at least 5',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithMinValue);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: '10',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail MIN_VALUE rule validation', async () => {
      const configWithMinValue = {
        ...mockConfiguration,
        type: ConfigurationType.NUMBER,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'MIN_VALUE',
            ruleValue: '5',
            errorMessage: 'Value must be at least 5',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithMinValue);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: '3',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be at least 5');
    });

    it('should validate MAX_VALUE rule successfully', async () => {
      const configWithMaxValue = {
        ...mockConfiguration,
        type: ConfigurationType.NUMBER,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'MAX_VALUE',
            ruleValue: '100',
            errorMessage: 'Value must be at most 100',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithMaxValue);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: '50',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail MAX_VALUE rule validation', async () => {
      const configWithMaxValue = {
        ...mockConfiguration,
        type: ConfigurationType.NUMBER,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'MAX_VALUE',
            ruleValue: '100',
            errorMessage: 'Value must be at most 100',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithMaxValue);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: '150',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be at most 100');
    });

    it('should validate REGEX rule successfully', async () => {
      const configWithRegex = {
        ...mockConfiguration,
        type: ConfigurationType.TEXT,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'REGEX',
            ruleValue: '^[A-Z]{3}$',
            errorMessage: 'Must be 3 uppercase letters',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithRegex);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'ABC',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail REGEX rule validation', async () => {
      const configWithRegex = {
        ...mockConfiguration,
        type: ConfigurationType.TEXT,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'REGEX',
            ruleValue: '^[A-Z]{3}$',
            errorMessage: 'Must be 3 uppercase letters',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithRegex);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'abc',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be 3 uppercase letters');
    });

    it('should handle CUSTOM rule validation', async () => {
      const configWithCustom = {
        ...mockConfiguration,
        type: ConfigurationType.TEXT,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'CUSTOM',
            ruleValue: 'custom_logic',
            errorMessage: 'Custom validation failed',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithCustom);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'test',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Custom validation for 'Test Configuration' not implemented");
    });

    it('should validate single choice options', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'option1',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid single choice option', async () => {
      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'invalid_option',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid option 'invalid_option' for configuration 'Test Configuration'");
    });

    it('should validate multiple choice options', async () => {
      const multiChoiceConfig = {
        ...mockConfiguration,
        type: ConfigurationType.MULTIPLE_CHOICE,
        isRequired: false,
      };
      prismaService.configuration.findFirst.mockResolvedValue(multiChoiceConfig);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'option1,option2',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate multiple choice options with spaces', async () => {
      const multiChoiceConfig = {
        ...mockConfiguration,
        type: ConfigurationType.MULTIPLE_CHOICE,
        isRequired: false,
      };
      prismaService.configuration.findFirst.mockResolvedValue(multiChoiceConfig);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: ' option1 , option2 ',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid multiple choice option', async () => {
      const multiChoiceConfig = {
        ...mockConfiguration,
        type: ConfigurationType.MULTIPLE_CHOICE,
        isRequired: false,
      };
      prismaService.configuration.findFirst.mockResolvedValue(multiChoiceConfig);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: 'option1,invalid_option',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid option 'invalid_option' for configuration 'Test Configuration'");
    });

    it('should skip inactive validation rules', async () => {
      const configWithInactiveRule = {
        ...mockConfiguration,
        type: ConfigurationType.NUMBER,
        isRequired: false,
        validationRules: [
          {
            id: 'rule-1',
            configurationId: 'config-1',
            ruleType: 'MIN_VALUE',
            ruleValue: '5',
            errorMessage: 'Value must be at least 5',
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };
      prismaService.configuration.findFirst.mockResolvedValue(configWithInactiveRule);

      const validateDto: ValidateConfigurationDto = {
        configurationId: 'config-1',
        value: '3',
      };

      const result = await service.validateConfiguration(validateDto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a configuration successfully', async () => {
      const updatedConfig = { ...mockConfiguration, ...mockUpdateDto };
      
      prismaService.configuration.findFirst.mockResolvedValue(mockConfiguration);
      prismaService.configuration.update.mockResolvedValue(updatedConfig);

      const result = await service.update('config-1', mockUpdateDto);

      expect(prismaService.configuration.update).toHaveBeenCalledWith({
        where: { id: 'config-1' },
        data: mockUpdateDto,
        include: {
          options: true,
          validationRules: true,
          parentDependencies: true,
          childDependencies: true,
        },
      });
      expect(result).toEqual(updatedConfig);
    });

    it('should throw NotFoundException when configuration not found', async () => {
      prismaService.configuration.findFirst.mockResolvedValue(null);

      await expect(service.update('non-existent', mockUpdateDto)).rejects.toThrow(
        new NotFoundException('Configuration with ID non-existent not found')
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a configuration when not in use', async () => {
      prismaService.configuration.findFirst.mockResolvedValue(mockConfiguration);
      prismaService.tabConfiguration.count.mockResolvedValue(0);
      prismaService.configuration.update.mockResolvedValue({
        ...mockConfiguration,
        isActive: false,
      });

      await service.remove('config-1');

      expect(prismaService.tabConfiguration.count).toHaveBeenCalledWith({
        where: { configurationId: 'config-1' },
      });
      expect(prismaService.configuration.update).toHaveBeenCalledWith({
        where: { id: 'config-1' },
        data: { isActive: false },
      });
    });

    it('should throw BadRequestException when configuration is in use', async () => {
      prismaService.configuration.findFirst.mockResolvedValue(mockConfiguration);
      prismaService.tabConfiguration.count.mockResolvedValue(2);

      await expect(service.remove('config-1')).rejects.toThrow(
        new BadRequestException(
          "Cannot delete configuration 'config-1' as it is still used in 2 tab(s). Remove it from all tabs first."
        )
      );
    });

    it('should throw NotFoundException when configuration not found', async () => {
      prismaService.configuration.findFirst.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        new NotFoundException('Configuration with ID non-existent not found')
      );
    });
  });
}); 
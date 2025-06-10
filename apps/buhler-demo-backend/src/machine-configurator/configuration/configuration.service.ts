import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ValidateConfigurationDto } from './dto/validate-configuration.dto';
import { Prisma } from '@prisma/client';
import { 
  ConfigurationWithOptions, 
  configurationWithOptions,
  ConfigurationType 
} from '../types/prisma-types';

interface FindAllOptions {
  type?: ConfigurationType;
}

@Injectable()
export class ConfigurationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createConfigurationDto: CreateConfigurationDto): Promise<ConfigurationWithOptions> {
    return await this.prisma.configuration.create({
      data: createConfigurationDto,
      ...configurationWithOptions,
    });
  }

  async findAll(options: FindAllOptions = {}): Promise<ConfigurationWithOptions[]> {
    const { type } = options;
    
    const whereConditions: Prisma.ConfigurationWhereInput = { isActive: true };
    
    if (type) {
      whereConditions.type = type;
    }

    return await this.prisma.configuration.findMany({
      where: whereConditions,
      orderBy: { name: 'asc' },
      ...configurationWithOptions,
    });
  }

  async findOne(id: string): Promise<ConfigurationWithOptions> {
    const configuration = await this.prisma.configuration.findFirst({
      where: { id, isActive: true },
      ...configurationWithOptions,
    });

    if (!configuration) {
      throw new NotFoundException(`Configuration with ID ${id} not found`);
    }

    return configuration;
  }

  async getDependencies(id: string): Promise<{
    parentDependencies: Prisma.ConfigurationDependencyGetPayload<{
      include: { parentConfiguration: { include: { options: true } } };
    }>[];
    childDependencies: Prisma.ConfigurationDependencyGetPayload<{
      include: { childConfiguration: { include: { options: true } } };
    }>[];
  }> {
    const configuration = await this.findOne(id);

    const parentDependencies = await this.prisma.configurationDependency.findMany({
      where: { childConfigurationId: id },
      include: {
        parentConfiguration: {
          include: { options: true },
        },
      },
    });

    const childDependencies = await this.prisma.configurationDependency.findMany({
      where: { parentConfigurationId: id },
      include: {
        childConfiguration: {
          include: { options: true },
        },
      },
    });

    return {
      parentDependencies,
      childDependencies,
    };
  }

  async validateConfiguration(validateDto: ValidateConfigurationDto): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const { configurationId, value } = validateDto;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get configuration with validation rules
    const configuration = await this.findOne(configurationId);

    // Check if required
    if (configuration.isRequired && (!value || value === '')) {
      errors.push(`Configuration '${configuration.name}' is required`);
    }

    // Apply validation rules
    for (const rule of configuration.validationRules || []) {
      if (!rule.isActive) continue;

      switch (rule.ruleType) {
        case 'MIN_VALUE':
          if (value && Number(value) < Number(rule.ruleValue)) {
            errors.push(rule.errorMessage);
          }
          break;
        case 'MAX_VALUE':
          if (value && Number(value) > Number(rule.ruleValue)) {
            errors.push(rule.errorMessage);
          }
          break;
        case 'REGEX':
          if (value && typeof rule.ruleValue === 'string' && !new RegExp(rule.ruleValue).test(String(value))) {
            errors.push(rule.errorMessage);
          }
          break;
        case 'CUSTOM':
          // Custom validation logic could be implemented here
          warnings.push(`Custom validation for '${configuration.name}' not implemented`);
          break;
      }
    }

    // Check if value is valid option (for choice types)
    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(configuration.type)) {
      const validOptions = configuration.options?.map(opt => opt.value) || [];
      const valuesToCheck = configuration.type === 'MULTIPLE_CHOICE' 
        ? (value as string).split(',').map(v => v.trim())
        : [value as string];

      for (const val of valuesToCheck) {
        if (val && !validOptions.includes(val)) {
          errors.push(`Invalid option '${val}' for configuration '${configuration.name}'`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async update(id: string, updateConfigurationDto: UpdateConfigurationDto): Promise<ConfigurationWithOptions> {
    await this.findOne(id); // Check if exists

    return await this.prisma.configuration.update({
      where: { id },
      data: updateConfigurationDto,
      ...configurationWithOptions,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    // Check if configuration is used in any tabs
    const usageCount = await this.prisma.tabConfiguration.count({
      where: { configurationId: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `Cannot delete configuration '${id}' as it is still used in ${usageCount} tab(s). Remove it from all tabs first.`
      );
    }

    await this.prisma.configuration.update({
      where: { id },
      data: { isActive: false },
    });
  }
} 
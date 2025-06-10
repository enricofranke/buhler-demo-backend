import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigurationTabDto } from './dto/create-configuration-tab.dto';
import { UpdateConfigurationTabDto } from './dto/update-configuration-tab.dto';
import { Prisma } from '@prisma/client';
import { 
  ConfigurationTabWithConfigurations, 
  configurationTabWithConfigurations 
} from '../types/prisma-types';

interface FindAllOptions {
  machineId?: string;
}

@Injectable()
export class ConfigurationTabService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createConfigurationTabDto: CreateConfigurationTabDto): Promise<ConfigurationTabWithConfigurations> {
    // Check if machine exists
    const machine = await this.prisma.machine.findFirst({
      where: { id: createConfigurationTabDto.machineId, isActive: true },
    });

    if (!machine) {
      throw new BadRequestException(`Machine with ID ${createConfigurationTabDto.machineId} not found`);
    }

    // Get next order number for this machine
    const maxOrder = await this.prisma.configurationTab.findFirst({
      where: { machineId: createConfigurationTabDto.machineId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (maxOrder?.order || 0) + 1;

    return await this.prisma.configurationTab.create({
      data: {
        ...createConfigurationTabDto,
        order: createConfigurationTabDto.order || nextOrder,
      },
      ...configurationTabWithConfigurations,
    });
  }

  async findAll(options: FindAllOptions = {}): Promise<ConfigurationTabWithConfigurations[]> {
    const { machineId } = options;
    
    const whereConditions: Prisma.ConfigurationTabWhereInput = { isActive: true };
    
    if (machineId) {
      whereConditions.machineId = machineId;
    }

    return await this.prisma.configurationTab.findMany({
      where: whereConditions,
      orderBy: [
        { machineId: 'asc' },
        { order: 'asc' },
      ],
      ...configurationTabWithConfigurations,
    });
  }

  async findOne(id: string): Promise<ConfigurationTabWithConfigurations> {
    const configurationTab = await this.prisma.configurationTab.findFirst({
      where: { id, isActive: true },
      ...configurationTabWithConfigurations,
    });

    if (!configurationTab) {
      throw new NotFoundException(`Configuration tab with ID ${id} not found`);
    }

    return configurationTab;
  }

  async getTabConfigurations(id: string): Promise<{
    tab: ConfigurationTabWithConfigurations;
    configurations: Prisma.TabConfigurationGetPayload<{
      include: {
        configuration: {
          include: {
            options: true;
            validationRules: true;
            parentDependencies: { include: { parentConfiguration: { include: { options: true } } } };
            childDependencies: { include: { childConfiguration: { include: { options: true } } } };
          };
        };
      };
    }>[];
  }> {
    const tab = await this.findOne(id);

    const tabConfigurations = await this.prisma.tabConfiguration.findMany({
      where: { 
        tabId: id,
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

    return {
      tab,
      configurations: tabConfigurations,
    };
  }

  async update(id: string, updateConfigurationTabDto: UpdateConfigurationTabDto): Promise<ConfigurationTabWithConfigurations> {
    await this.findOne(id); // Check if exists

    return await this.prisma.configurationTab.update({
      where: { id },
      data: updateConfigurationTabDto,
      ...configurationTabWithConfigurations,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    // Check if tab has configurations
    const configCount = await this.prisma.tabConfiguration.count({
      where: { tabId: id },
    });

    if (configCount > 0) {
      throw new BadRequestException(
        `Cannot delete configuration tab '${id}' as it still has ${configCount} configuration(s). Remove all configurations first.`
      );
    }

    await this.prisma.configurationTab.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
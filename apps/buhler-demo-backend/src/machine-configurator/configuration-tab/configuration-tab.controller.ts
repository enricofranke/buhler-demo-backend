import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ConfigurationTabService } from './configuration-tab.service';
import { CreateConfigurationTabDto } from './dto/create-configuration-tab.dto';
import { UpdateConfigurationTabDto } from './dto/update-configuration-tab.dto';
import { ConfigurationTabWithConfigurations, TabConfigurationComplete } from '../types/prisma-types';

@ApiBearerAuth()
@ApiTags('configuration-tabs')
@Controller('configuration-tabs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfigurationTabController {
  constructor(private readonly configurationTabService: ConfigurationTabService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create configuration tab' })
  @ApiResponse({ 
    status: 201, 
    description: 'The record has been successfully created.',
    type: Object 
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createConfigurationTabDto: CreateConfigurationTabDto): Promise<ConfigurationTabWithConfigurations> {
    return this.configurationTabService.create(createConfigurationTabDto);
  }

  @Get()
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get all configuration tabs' })
  @ApiQuery({ name: 'machineId', required: false, description: 'Filter by machine ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all records.',
    type: [Object] 
  })
  async findAll(@Query('machineId') machineId?: string): Promise<ConfigurationTabWithConfigurations[]> {
    return this.configurationTabService.findAll({ machineId });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get configuration tab by id' })
  @ApiParam({ name: 'id', description: 'Configuration Tab ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found record.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findOne(@Param('id') id: string): Promise<ConfigurationTabWithConfigurations> {
    return this.configurationTabService.findOne(id);
  }

  @Get(':id/configurations')
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get all configurations for a tab' })
  @ApiParam({ name: 'id', description: 'Configuration Tab ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tab configurations with full configuration data.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getTabConfigurations(@Param('id') id: string): Promise<{
    tab: ConfigurationTabWithConfigurations;
    configurations: TabConfigurationComplete[];
  }> {
    return this.configurationTabService.getTabConfigurations(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update configuration tab' })
  @ApiParam({ name: 'id', description: 'Configuration Tab ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body() updateConfigurationTabDto: UpdateConfigurationTabDto
  ): Promise<ConfigurationTabWithConfigurations> {
    return this.configurationTabService.update(id, updateConfigurationTabDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete configuration tab' })
  @ApiParam({ name: 'id', description: 'Configuration Tab ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.configurationTabService.remove(id);
  }
}
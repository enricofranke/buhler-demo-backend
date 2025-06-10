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
import { ConfigurationService } from './configuration.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ValidateConfigurationDto } from './dto/validate-configuration.dto';
import { ConfigurationWithOptions } from '../types/prisma-types';
import { ConfigurationType } from './enums/configuration-type.enum';

@ApiBearerAuth()
@ApiTags('configurations')
@Controller('configurations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create configuration' })
  @ApiResponse({ 
    status: 201, 
    description: 'The record has been successfully created.',
    type: Object 
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createConfigurationDto: CreateConfigurationDto): Promise<ConfigurationWithOptions> {
    return this.configurationService.create(createConfigurationDto);
  }

  @Get()
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get all configurations' })
  @ApiQuery({ name: 'type', required: false, enum: ConfigurationType, description: 'Filter by configuration type' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all records.',
    type: [Object] 
  })
  async findAll(@Query('type') type?: ConfigurationType): Promise<ConfigurationWithOptions[]> {
    return this.configurationService.findAll({ type });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get configuration by id' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found record.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findOne(@Param('id') id: string): Promise<ConfigurationWithOptions> {
    return this.configurationService.findOne(id);
  }

  @Get(':id/dependencies')
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get configuration dependencies' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuration dependencies.',
    type: 'object'
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getDependencies(@Param('id') id: string): Promise<{
    parentDependencies: Array<{
      id: string;
      parentConfigurationId: string;
      childConfigurationId: string;
      condition: string;
      action: string;
      parentConfiguration: { id: string; name: string; options: Array<{ id: string; value: string; displayName: string }> };
    }>;
    childDependencies: Array<{
      id: string;
      parentConfigurationId: string;
      childConfigurationId: string;
      condition: string;
      action: string;
      childConfiguration: { id: string; name: string; options: Array<{ id: string; value: string; displayName: string }> };
    }>;
  }> {
    return this.configurationService.getDependencies(id);
  }

  @Post('validate')
  @Roles('ADMIN', 'SALES')
  @ApiOperation({ summary: 'Validate configuration' })
  @ApiResponse({ 
    status: 200, 
    description: 'Validation result.',
    type: 'object'
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async validate(@Body() validateConfigurationDto: ValidateConfigurationDto): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return this.configurationService.validateConfiguration(validateConfigurationDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update configuration' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body() updateConfigurationDto: UpdateConfigurationDto
  ): Promise<ConfigurationWithOptions> {
    return this.configurationService.update(id, updateConfigurationDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete configuration' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.configurationService.remove(id);
  }
} 
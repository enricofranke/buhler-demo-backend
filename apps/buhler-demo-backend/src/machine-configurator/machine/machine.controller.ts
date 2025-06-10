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
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { MachineWithBasicRelations, MachineWithFullConfiguration } from '../types/prisma-types';

@ApiBearerAuth()
@ApiTags('machines')
@Controller('machines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create machine' })
  @ApiResponse({ 
    status: 201, 
    description: 'The record has been successfully created.',
    type: Object 
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createMachineDto: CreateMachineDto): Promise<MachineWithBasicRelations> {
    return this.machineService.create(createMachineDto);
  }

  @Get()
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get all machines' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Filter by machine group ID' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma separated)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all records.',
    type: [Object] 
  })
  async findAll(
    @Query('groupId') groupId?: string,
    @Query('tags') tags?: string
  ): Promise<MachineWithBasicRelations[]> {
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    return this.machineService.findAll({ groupId, tags: tagArray });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get machine by id' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found record.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findOne(@Param('id') id: string): Promise<MachineWithBasicRelations> {
    return this.machineService.findOne(id);
  }

  @Get(':id/configuration')
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get machine with full configuration' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The machine with full configuration.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getMachineConfiguration(@Param('id') id: string): Promise<MachineWithFullConfiguration> {
    return this.machineService.getMachineWithConfiguration(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update machine' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto
  ): Promise<MachineWithBasicRelations> {
    return this.machineService.update(id, updateMachineDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete machine' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.machineService.remove(id);
  }
} 
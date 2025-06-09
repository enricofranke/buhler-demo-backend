import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { MachineGroupService } from './machine-group.service';
import { CreateMachineGroupDto } from './dto/create-machine-group.dto';
import { UpdateMachineGroupDto } from './dto/update-machine-group.dto';
import { MachineGroupWithMachines } from '../types/prisma-types';

@ApiBearerAuth()
@ApiTags('machine-groups')
@Controller('machine-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachineGroupController {
  constructor(private readonly machineGroupService: MachineGroupService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create machine group' })
  @ApiResponse({ 
    status: 201, 
    description: 'The record has been successfully created.',
    type: Object 
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createMachineGroupDto: CreateMachineGroupDto): Promise<MachineGroupWithMachines> {
    return this.machineGroupService.create(createMachineGroupDto);
  }

  @Get()
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get all machine groups' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all records.',
    type: [Object] 
  })
  async findAll(): Promise<MachineGroupWithMachines[]> {
    return this.machineGroupService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES', 'USER')
  @ApiOperation({ summary: 'Get machine group by id' })
  @ApiParam({ name: 'id', description: 'Machine Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found record.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findOne(@Param('id') id: string): Promise<MachineGroupWithMachines> {
    return this.machineGroupService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update machine group' })
  @ApiParam({ name: 'id', description: 'Machine Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body() updateMachineGroupDto: UpdateMachineGroupDto
  ): Promise<MachineGroupWithMachines> {
    return this.machineGroupService.update(id, updateMachineGroupDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete machine group' })
  @ApiParam({ name: 'id', description: 'Machine Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.machineGroupService.remove(id);
  }
} 
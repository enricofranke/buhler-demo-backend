import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineGroupDto } from './dto/create-machine-group.dto';
import { UpdateMachineGroupDto } from './dto/update-machine-group.dto';
import { MachineGroupWithMachines, machineGroupWithMachines } from '../types/prisma-types';

@Injectable()
export class MachineGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMachineGroupDto: CreateMachineGroupDto): Promise<MachineGroupWithMachines> {
    return await this.prisma.machineGroup.create({
      data: createMachineGroupDto,
      ...machineGroupWithMachines,
    });
  }

  async findAll(): Promise<MachineGroupWithMachines[]> {
    return await this.prisma.machineGroup.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      ...machineGroupWithMachines,
    });
  }

  async findOne(id: string): Promise<MachineGroupWithMachines> {
    const machineGroup = await this.prisma.machineGroup.findFirst({
      where: { id, isActive: true },
      ...machineGroupWithMachines,
    });

    if (!machineGroup) {
      throw new NotFoundException(`Machine group with ID ${id} not found`);
    }

    return machineGroup;
  }

  async update(id: string, updateMachineGroupDto: UpdateMachineGroupDto): Promise<MachineGroupWithMachines> {
    await this.findOne(id); // Check if exists

    return await this.prisma.machineGroup.update({
      where: { id },
      data: updateMachineGroupDto,
      ...machineGroupWithMachines,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.machineGroup.update({
      where: { id },
      data: { isActive: false },
    });
  }
} 
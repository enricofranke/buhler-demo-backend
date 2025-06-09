import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { Prisma } from '@prisma/client';
import { 
  MachineWithBasicRelations, 
  MachineWithFullConfiguration,
  machineWithBasicRelations,
  machineWithFullConfiguration
} from '../types/prisma-types';

interface FindAllOptions {
  groupId?: string;
  tags?: string[];
}

@Injectable()
export class MachineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMachineDto: CreateMachineDto): Promise<MachineWithBasicRelations> {
    return await this.prisma.machine.create({
      data: createMachineDto,
      ...machineWithBasicRelations,
    });
  }

  async findAll(options: FindAllOptions = {}): Promise<MachineWithBasicRelations[]> {
    const { groupId, tags } = options;
    
    const whereConditions: Prisma.MachineWhereInput = { isActive: true };
    
    if (groupId) {
      whereConditions.groupId = groupId;
    }
    
    if (tags && tags.length > 0) {
      whereConditions.tags = {
        hasSome: tags,
      };
    }

    return await this.prisma.machine.findMany({
      where: whereConditions,
      orderBy: { name: 'asc' },
      ...machineWithBasicRelations,
    });
  }

  async findOne(id: string): Promise<MachineWithBasicRelations> {
    const machine = await this.prisma.machine.findFirst({
      where: { id, isActive: true },
      ...machineWithBasicRelations,
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }

  async getMachineWithConfiguration(id: string): Promise<MachineWithFullConfiguration> {
    const machine = await this.prisma.machine.findFirst({
      where: { id, isActive: true },
      ...machineWithFullConfiguration,
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<MachineWithBasicRelations> {
    await this.findOne(id); // Check if exists

    return await this.prisma.machine.update({
      where: { id },
      data: updateMachineDto,
      ...machineWithBasicRelations,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.machine.update({
      where: { id },
      data: { isActive: false },
    });
  }
} 
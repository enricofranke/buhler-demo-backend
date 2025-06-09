import { Module } from '@nestjs/common';
import { MachineGroupController } from './machine-group.controller';
import { MachineGroupService } from './machine-group.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MachineGroupController],
  providers: [MachineGroupService],
  exports: [MachineGroupService],
})
export class MachineGroupModule {}
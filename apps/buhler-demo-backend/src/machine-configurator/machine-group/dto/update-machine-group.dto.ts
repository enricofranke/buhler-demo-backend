import { PartialType } from '@nestjs/swagger';
import { CreateMachineGroupDto } from './create-machine-group.dto';

export class UpdateMachineGroupDto extends PartialType(CreateMachineGroupDto) {}
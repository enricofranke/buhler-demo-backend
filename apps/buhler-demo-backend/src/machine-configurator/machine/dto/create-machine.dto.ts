import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsArray, MaxLength } from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({ 
    description: 'The name of the machine',
    example: 'CNC Grinding Machine Pro'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ 
    description: 'The description of the machine',
    example: 'High precision CNC grinding machine for industrial applications'
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ 
    description: 'Machine group ID',
    required: false,
    example: 'clhd8f0d3000008jk8sj2k3l4'
  })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ 
    description: 'Tags for alternative grouping',
    required: false,
    type: [String],
    example: ['precision', 'cnc', 'industrial']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
} 
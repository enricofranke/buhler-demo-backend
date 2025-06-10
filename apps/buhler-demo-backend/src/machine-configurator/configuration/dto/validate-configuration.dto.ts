import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ValidateConfigurationDto {
  @ApiProperty({ 
    description: 'The ID of the configuration to validate',
    example: 'clhd8f0d3000008jk8sj2k3l4'
  })
  @IsString()
  @IsNotEmpty()
  configurationId!: string;

  @ApiProperty({ 
    description: 'The value to validate',
    example: 'clean_room_version'
  })
  @IsOptional()
  value?: string | number | boolean;

  @ApiProperty({ 
    description: 'Additional context for validation',
    required: false,
    example: { machineId: 'machine-123', tabId: 'tab-456' }
  })
  @IsOptional()
  context?: Record<string, string | number | boolean>;
}
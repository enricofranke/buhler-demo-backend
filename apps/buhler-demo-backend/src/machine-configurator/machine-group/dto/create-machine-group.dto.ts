import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMachineGroupDto {
  @ApiProperty({ 
    description: 'The name of the machine group',
    example: 'Grinding Machines'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ 
    description: 'The description of the machine group',
    example: 'High precision grinding machines for industrial applications'
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ 
    description: 'Color for UI representation',
    required: false,
    example: '#3498db'
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiProperty({ 
    description: 'Icon identifier',
    required: false,
    example: 'mdi-cog'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
} 
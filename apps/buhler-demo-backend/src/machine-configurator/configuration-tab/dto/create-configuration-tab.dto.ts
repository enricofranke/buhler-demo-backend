import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateConfigurationTabDto {
  @ApiProperty({ 
    description: 'The ID of the machine this tab belongs to',
    example: 'clhd8f0d3000008jk8sj2k3l4'
  })
  @IsString()
  @IsNotEmpty()
  machineId!: string;

  @ApiProperty({ 
    description: 'The name of the configuration tab',
    example: 'Equipment'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ 
    description: 'The description of the configuration tab',
    required: false,
    example: 'Basic equipment configuration options'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Order/position of the tab',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}
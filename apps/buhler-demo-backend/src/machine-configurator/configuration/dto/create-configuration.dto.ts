import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ConfigurationType } from '../enums/configuration-type.enum';

export class CreateConfigurationDto {
  @ApiProperty({ 
    description: 'The name of the configuration',
    example: 'Machine Design'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ 
    description: 'The description of the configuration',
    example: 'Choose the design variant for your machine'
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ 
    description: 'Help text for users',
    example: 'Select the design that best fits your production environment'
  })
  @IsString()
  @IsNotEmpty()
  helpText!: string;

  @ApiProperty({ 
    description: 'Type of the configuration',
    enum: ConfigurationType,
    example: ConfigurationType.SINGLE_CHOICE
  })
  @IsEnum(ConfigurationType)
  type!: ConfigurationType;

  @ApiProperty({ 
    description: 'Whether this configuration is required',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ 
    description: 'AI logic hint for decision making',
    required: false,
    example: 'Clean Room for Pharma/Food, Open for Standard-Industry'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  aiLogicHint?: string;
} 
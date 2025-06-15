import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateQuotationConfigurationDto {
  @ApiProperty({ description: 'The configuration ID' })
  @IsUUID()
  configurationId: string;

  @ApiProperty({ description: 'The selected option ID', required: false })
  @IsOptional()
  @IsUUID()
  selectedOptionId?: string;

  @ApiProperty({ description: 'Custom value for text/number configurations', required: false })
  @IsOptional()
  @IsString()
  customValue?: string;

  @ApiProperty({ description: 'Notes for this configuration', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 
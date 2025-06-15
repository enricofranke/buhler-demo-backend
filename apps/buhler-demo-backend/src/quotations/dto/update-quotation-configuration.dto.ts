import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateQuotationConfigurationDto {
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
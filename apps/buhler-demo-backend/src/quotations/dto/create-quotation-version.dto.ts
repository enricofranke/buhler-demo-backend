import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateQuotationVersionDto {
  @ApiProperty({ description: 'The title for the new version', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Notes describing the changes in this version', required: false })
  @IsOptional()
  @IsString()
  versionNotes?: string;

  @ApiProperty({ description: 'The validity date for the new version', required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
} 
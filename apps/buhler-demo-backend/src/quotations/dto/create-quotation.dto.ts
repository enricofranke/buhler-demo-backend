import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateQuotationDto {
  @ApiProperty({ description: 'The title of the quotation', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'The machine ID', required: false })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @ApiProperty({ description: 'The currency code', default: 'EUR', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'The validity date', required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
} 
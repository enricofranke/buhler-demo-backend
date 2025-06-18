import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { QuotationStatus } from '@prisma/client';

export class UpdateQuotationDto {
  @ApiProperty({ description: 'The title of the quotation', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The quotation status', enum: QuotationStatus, required: false })
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @ApiProperty({ description: 'The machine ID', required: false })
  @IsOptional()
  @IsString()
  machineId?: string;

  @ApiProperty({ description: 'The total price', required: false })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiProperty({ description: 'The currency code', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'The validity date', required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
} 
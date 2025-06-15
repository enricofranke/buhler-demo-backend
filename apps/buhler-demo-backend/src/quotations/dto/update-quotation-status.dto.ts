import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { QuotationStatus } from '@prisma/client';

export class UpdateQuotationStatusDto {
  @ApiProperty({ description: 'The new quotation status', enum: QuotationStatus })
  @IsEnum(QuotationStatus)
  status: QuotationStatus;
}
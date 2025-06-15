import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({ description: 'The company name', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'The contact person name', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: 'The email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'The phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'The address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'The country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Whether the customer is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 
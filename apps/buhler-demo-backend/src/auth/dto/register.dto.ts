import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'user@example.com' 
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ 
    description: 'User password',
    example: 'password123',
    minLength: 8 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password!: string;

  @ApiProperty({ 
    description: 'User first name',
    example: 'John',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly firstName?: string;

  @ApiProperty({ 
    description: 'User last name',
    example: 'Doe',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly lastName?: string;

  @ApiProperty({ 
    description: 'User display name',
    example: 'John Doe',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly displayName?: string;
} 
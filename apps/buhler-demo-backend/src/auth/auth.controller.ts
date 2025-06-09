import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { UserWithRoles, UserProfile } from '../users/types/user.interface';
import type { AuthResponse, LoginResponse, RefreshTokenResponse } from './types/auth.interface';

interface PublicInfoResponse {
  readonly message: string;
  readonly appName: string;
  readonly version: string;
}

interface DashboardResponse {
  readonly message: string;
  readonly data: {
    readonly totalSales: number;
    readonly activeDeals: number;
    readonly pipeline: string;
  };
}

interface AdminResponse {
  readonly message: string;
  readonly timestamp: string;
}



/**
 * Controller for authentication and authorization endpoints
 */
@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        },
        expiresIn: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user with credentials' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        },
        expiresIn: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Request() req: any): Promise<LoginResponse> {
    return this.authService.loginWithCredentials(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the current user profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        email: { type: 'string', example: 'user@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  async getUserProfile(@CurrentUser() user: UserWithRoles): Promise<UserProfile> {
    return this.usersService.convertToUserProfile(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  async logoutUser(
    @CurrentUser() user: UserWithRoles,
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<{ message: string }> {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return {
      message: 'Logout successful',
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user from all devices' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged out from all devices',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out from all devices' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  async logoutFromAllDevices(@CurrentUser() user: UserWithRoles): Promise<{ message: string }> {
    await this.authService.logoutFromAllDevices(user.id);
    return {
      message: 'Logged out from all devices',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user with roles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the current user with roles',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        email: { type: 'string', example: 'user@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        userRoles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'ADMIN' }
                }
              }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  async getCurrentUser(@CurrentUser() user: UserWithRoles): Promise<UserWithRoles> {
    const currentUser = await this.authService.findUserById(user.id);
    if (!currentUser) {
      throw new Error('User not found');
    }
    return currentUser;
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get admin-only content' })
  @ApiResponse({ 
    status: 200, 
    description: 'Admin-only content accessible to ADMIN users only',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'This endpoint is only accessible to ADMIN users' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions (ADMIN role required)' })
  async getAdminOnlyContent(): Promise<AdminResponse> {
    return {
      message: 'This endpoint is only accessible to ADMIN users',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('sales-dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SALES')
  @ApiOperation({ summary: 'Get sales dashboard' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sales dashboard data accessible to ADMIN and SALES users',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Welcome to the Sales Dashboard - accessible to ADMIN and SALES users' },
        data: {
          type: 'object',
          properties: {
            totalSales: { type: 'number', example: 125000 },
            activeDeals: { type: 'number', example: 23 },
            pipeline: { type: 'string', example: 'Q1 targets on track' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions (ADMIN or SALES role required)' })
  async getSalesDashboard(): Promise<DashboardResponse> {
    return {
      message: 'Welcome to the Sales Dashboard - accessible to ADMIN and SALES users',
      data: {
        totalSales: 125000,
        activeDeals: 23,
        pipeline: 'Q1 targets on track',
      },
    };
  }

  @Get('public-info')
  @Public()
  @ApiOperation({ summary: 'Get public application information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Public information available without authentication',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'This is a public endpoint - no authentication required' },
        appName: { type: 'string', example: 'explore.dg' },
        version: { type: 'string', example: '1.0.0' }
      }
    }
  })
  async getPublicInfo(): Promise<PublicInfoResponse> {
    return {
      message: 'This is a public endpoint - no authentication required',
      appName: 'explore.dg',
      version: '1.0.0',
    };
  }
} 
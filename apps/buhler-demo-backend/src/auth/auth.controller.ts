import {
  Controller,
  Get,
  Post,
  UseGuards,
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
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import type { UserWithRoles, UserProfile } from '../users/types/user.interface';
import type { AuthResponse } from './types/auth.interface';

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

interface LogoutResponse {
  readonly message: string;
  readonly user: {
    readonly id: string;
    readonly email: string;
  };
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
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'user@example.com' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  async logoutUser(@CurrentUser() user: UserWithRoles): Promise<LogoutResponse> {
    return {
      message: 'Logout successful',
      user: {
        id: user.id,
        email: user.email,
      },
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
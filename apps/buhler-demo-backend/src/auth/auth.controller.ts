import {
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
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
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}



  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@CurrentUser() user: UserWithRoles): Promise<UserProfile> {
    return this.usersService.convertToUserProfile(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
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
  async getAdminOnlyContent(): Promise<AdminResponse> {
    return {
      message: 'This endpoint is only accessible to ADMIN users',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('sales-dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SALES')
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
  async getPublicInfo(): Promise<PublicInfoResponse> {
    return {
      message: 'This is a public endpoint - no authentication required',
      appName: 'explore.dg',
      version: '1.0.0',
    };
  }


} 
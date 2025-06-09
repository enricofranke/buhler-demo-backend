import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { TokenService } from './services/token.service';
import * as bcrypt from 'bcrypt';
import type { UserWithRoles, UserProfile } from '../users/types/user.interface';
import type { AuthResponse, JwtPayload, LoginResponse, TokenPair, RefreshTokenResponse } from './types/auth.interface';
import type { RegisterDto } from './dto/register.dto';

/**
 * Service responsible for authentication and authorization
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<UserWithRoles | null> {
    return this.usersService.findUserById(id);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<UserWithRoles | null> {
    return this.usersService.findUserByEmail(email);
  }

  /**
   * Generate access token for user
   */
  async generateAccessToken(user: UserWithRoles): Promise<string> {
    const roles = this.usersService.extractUserRoleNames(user);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: roles[0] || 'USER',
      roles: roles,
    };
    return this.jwtService.signAsync(payload);
  }

  /**
   * Login user and return auth response
   */
  async login(user: UserWithRoles): Promise<AuthResponse> {
    const accessToken = await this.generateAccessToken(user);
    return {
      user,
      accessToken,
    };
  }

  /**
   * Validate user credentials for local strategy
   */
  async validateUser(email: string, password: string): Promise<UserWithRoles | null> {
    const user = await this.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    if (!this.usersService.isUserValid(user)) {
      return null;
    }

    return user;
  }

  /**
   * Get user roles by user ID
   */
  async getUserRoles(userId: string): Promise<string[]> {
    return this.rolesService.getUserRoles(userId);
  }

  /**
   * Check if user has specific role
   */
  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    return this.rolesService.hasUserRole(userId, roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  async userHasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    return this.rolesService.hasUserAnyRole(userId, roleNames);
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.usersService.createUser({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      displayName: registerDto.displayName,
      passwordHash,
    });

    // Assign default USER role
    const userRoleIds = await this.rolesService.getRoleIdsByNames(['USER']);
    await this.rolesService.assignRolesToUser(user.id, userRoleIds);

    // Generate tokens
    const tokenPair = await this.generateTokenPair(user);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: this.usersService.convertToUserProfile(user),
      expiresIn: tokenPair.expiresIn,
    };
  }

  /**
   * Login user with credentials
   */
  async loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokenPair = await this.generateTokenPair(user);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: this.usersService.convertToUserProfile(user),
      expiresIn: tokenPair.expiresIn,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<RefreshTokenResponse> {
    const userId = await this.tokenService.validateRefreshToken(refreshToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.findUserById(userId);
    if (!user || !this.usersService.isUserValid(user)) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old refresh token
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Generate new token pair
    const tokenPair = await this.generateTokenPair(user);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
    };
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Logout user from all devices
   */
  async logoutFromAllDevices(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
  }

  /**
   * Generate token pair (access + refresh)
   */
  async generateTokenPair(user: UserWithRoles): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);
    
    const expiresIn = this.parseExpirationTime(
      this.configService.get<string>('JWT_EXPIRATION', '15m')
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(expiration: string): number {
    const timeValue = parseInt(expiration.slice(0, -1));
    const timeUnit = expiration.slice(-1);
    
    switch (timeUnit) {
      case 's': return timeValue;
      case 'm': return timeValue * 60;
      case 'h': return timeValue * 3600;
      case 'd': return timeValue * 86400;
      default: return 900; // 15 minutes default
    }
  }
} 
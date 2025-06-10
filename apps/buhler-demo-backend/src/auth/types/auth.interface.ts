import type { UserWithRoles, UserProfile } from '../../users/types/user.interface';

export interface AuthResponse {
  readonly user: UserWithRoles;
  readonly accessToken: string;
}

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
  readonly roles?: readonly string[];
  readonly iat?: number;
  readonly exp?: number;
}

export interface RefreshTokenPayload {
  readonly sub: string;
  readonly tokenId: string;
  readonly iat?: number;
  readonly exp?: number;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: UserProfile;
  readonly expiresIn: number;
}

export interface RefreshTokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
} 
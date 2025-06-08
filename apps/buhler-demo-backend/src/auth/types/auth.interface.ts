import type { UserWithRoles } from '../../users/types/user.interface';

export interface AuthResponse {
  readonly user: UserWithRoles;
  readonly accessToken: string;
}

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
  readonly roles?: readonly string[];
  readonly iat?: number;
  readonly exp?: number;
} 
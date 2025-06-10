import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import type { RefreshTokenPayload } from '../types/auth.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<string> {
    const tokenId = crypto.randomUUID();
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    
    const payload: RefreshTokenPayload = {
      sub: userId,
      tokenId,
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn,
    });

    const hashedToken = this.hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prismaService.refreshToken.create({
      data: {
        id: tokenId,
        token: hashedToken,
        userId,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return refreshToken;
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const hashedToken = this.hashToken(token);
      const storedToken = await this.prismaService.refreshToken.findFirst({
        where: {
          id: payload.tokenId,
          token: hashedToken,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        return null;
      }

      return storedToken.userId;
    } catch (error) {
      return null;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      await this.prismaService.refreshToken.updateMany({
        where: {
          id: payload.tokenId,
        },
        data: {
          isRevoked: true,
        },
      });
    } catch (error) {
      // Token is invalid, ignore
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
} 
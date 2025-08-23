import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(userId: string, username: string, role: string): TokenPair {
    const payload = { sub: userId, username, role };
    const secret = this.configService.get<string>('JWT_SECRET');

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Invalid token: ${error.message}`
          : 'Invalid token';
      throw new UnauthorizedException(errorMessage, { cause: error });
    }
  }

  verifyRefreshToken(refreshToken: string): JwtPayload {
    try {
      return this.jwtService.verify(refreshToken);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Invalid refresh token: ${error.message}`
          : 'Invalid refresh token';
      throw new UnauthorizedException(errorMessage, { cause: error });
    }
  }
}

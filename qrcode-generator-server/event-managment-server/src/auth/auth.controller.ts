import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Response } from 'express';

import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles/roles.guard.js';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface.js';
import { User } from '../users/schemas/users.schema/users.schema.js';

import { AuthService } from './auth.service.js';
import { JwtPayload } from './services/auth-token.service.js';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'master')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) reply: Response,
  ): Promise<{ message: string }> {
    const tokens = await this.authService.register(username, password);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    reply.cookie('auth-cookie', tokens.accessToken, options);
    reply.cookie('refresh-cookie', tokens.refreshToken, options);

    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) reply: Response,
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: { username: string; role: string };
  }> {
    const { accessToken, refreshToken, user } = await this.authService.login(
      username,
      password,
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    reply.cookie('auth-cookie', accessToken, options);
    reply.cookie('refresh-cookie', refreshToken, options);

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) reply: Response,
  ): Promise<{ message: string }> {
    reply.clearCookie('auth-cookie', { path: '/' } as CookieOptions);
    reply.clearCookie('refresh-cookie', { path: '/' } as CookieOptions);

    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() request: RequestWithUser): Promise<User> {
    return this.authService.getUser(request.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Post('protected')
  protectedRoute(): { message: string } {
    return { message: 'You have access!' };
  }

  @Post('refresh')
  async refresh(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) reply: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = request.cookies['refresh-cookie'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    reply.cookie('auth-cookie', tokens.accessToken, options);
    reply.cookie('refresh-cookie', tokens.refreshToken, options);

    return tokens;
  }

  @Post('verify')
  async verify(@Body('token') token: string): Promise<{
    valid: boolean;
    payload: JwtPayload;
  }> {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, payload };
    } catch (error) {
      this.logger.error('JWT Verification Error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

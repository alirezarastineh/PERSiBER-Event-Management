import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard/jwt-auth.guard';
import { Request } from 'express';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
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
    @Req() request: RequestWithUser,
  ) {
    const tokens = await this.authService.register(username, password);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    request.res.cookie('auth-cookie', tokens.accessToken, options);
    request.res.cookie('refresh-cookie', tokens.refreshToken, options);

    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Req() request: Request,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      username,
      password,
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    request.res.cookie('auth-cookie', accessToken, options);
    request.res.cookie('refresh-cookie', refreshToken, options);

    return {
      message: 'Login successful',
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  @Post('logout')
  async logout(@Req() request: Request) {
    request.res.clearCookie('auth-cookie');
    request.res.clearCookie('refresh-cookie');

    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() request: RequestWithUser) {
    return this.authService.getUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('protected')
  protectedRoute() {
    return { message: 'You have access!' };
  }

  @Post('refresh')
  async refresh(@Req() request: Request) {
    const refreshToken = request.cookies['refresh-cookie'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    request.res.cookie('auth-cookie', tokens.accessToken, options);
    request.res.cookie('refresh-cookie', tokens.refreshToken, options);

    return tokens;
  }

  @Post('verify')
  async verify(@Body('token') token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, payload };
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

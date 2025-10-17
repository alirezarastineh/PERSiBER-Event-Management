import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RequestWithUser } from '../../interfaces/request-with-user.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('No JWT token found');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request.user = payload;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Invalid JWT token: ${error.message}`
          : 'Invalid JWT token';

      throw new UnauthorizedException(errorMessage, { cause: error });
    }

    return true;
  }

  private extractTokenFromRequest(request: RequestWithUser): string | null {
    const headerToken = request.headers?.authorization?.split(' ')[1];
    if (headerToken) {
      return headerToken;
    }
    const cookieToken = request.cookies?.['auth-cookie'];
    return cookieToken ?? null;
  }
}

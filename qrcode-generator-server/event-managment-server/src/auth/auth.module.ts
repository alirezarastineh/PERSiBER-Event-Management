import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard/jwt-auth.guard.js';
import { UsersModule } from '../users/users.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthPasswordService } from './services/auth-password.service.js';
import { AuthRoleService } from './services/auth-role.service.js';
import { AuthTokenService } from './services/auth-token.service.js';
import { AuthValidationService } from './services/auth-validation.service.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as unknown as number,
          },
        };
      },
    }),
    ConfigModule,
  ],
  providers: [
    AuthService,
    AuthTokenService,
    AuthPasswordService,
    AuthValidationService,
    AuthRoleService,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

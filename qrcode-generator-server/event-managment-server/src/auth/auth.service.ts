import { Injectable } from '@nestjs/common';
import { User } from 'src/users/schemas/users.schema/users.schema';
import { UsersService } from 'src/users/users.service';

import { AuthPasswordService } from './services/auth-password.service';
import { AuthRoleService } from './services/auth-role.service';
import { AuthTokenService, TokenPair } from './services/auth-token.service';
import { AuthValidationService } from './services/auth-validation.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: AuthTokenService,
    private readonly passwordService: AuthPasswordService,
    private readonly validationService: AuthValidationService,
    private readonly roleService: AuthRoleService,
  ) {}

  async register(username: string, password: string): Promise<TokenPair> {
    this.validationService.validateRegistrationData(username, password);
    await this.validationService.validateUserExists(username);

    const hashedPassword = await this.passwordService.hashPassword(password);
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
      role: 'user',
    });

    return this.tokenService.generateTokens(
      user._id.toString(),
      user.username,
      user.role,
    );
  }

  async login(
    username: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { username: string; role: string };
  }> {
    const user = await this.validationService.validateCredentials(
      username,
      password,
    );

    const tokens = this.tokenService.generateTokens(
      user._id.toString(),
      user.username,
      user.role,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  async getUser(userId: string): Promise<User> {
    return this.validationService.validateUserById(userId);
  }

  async updateRole(userId: string, role: string): Promise<User> {
    return this.roleService.updateUserRole(userId, role);
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findOne(payload.username);
    if (!user) {
      throw new Error('User not found for refresh token');
    }

    return this.tokenService.generateTokens(
      user._id.toString(),
      user.username,
      user.role,
    );
  }
}

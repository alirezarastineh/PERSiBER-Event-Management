import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/users/schemas/users.schema/users.schema';
import { UsersService } from 'src/users/users.service';

import { AuthPasswordService } from './auth-password.service';

@Injectable()
export class AuthValidationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: AuthPasswordService,
  ) {}

  async validateUserExists(username: string): Promise<void> {
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
  }

  async validateCredentials(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  validateRegistrationData(username: string, password: string): void {
    if (!username || username.trim().length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }

    if (!this.passwordService.validatePasswordStrength(password)) {
      throw new BadRequestException(
        'Password must be at least 4 characters long',
      );
    }
  }
}

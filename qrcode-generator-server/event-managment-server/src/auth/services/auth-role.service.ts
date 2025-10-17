import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { User } from '../../users/schemas/users.schema/users.schema.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class AuthRoleService {
  private readonly validRoles = ['user', 'admin', 'master'];

  validateRole(role: string): void {
    if (!this.validRoles.includes(role)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${this.validRoles.join(', ')}`,
      );
    }
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    this.validateRole(role);

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    return user.save();
  }

  getValidRoles(): string[] {
    return [...this.validRoles];
  }

  isValidRole(role: string): boolean {
    return this.validRoles.includes(role);
  }

  constructor(private readonly usersService: UsersService) {}
}

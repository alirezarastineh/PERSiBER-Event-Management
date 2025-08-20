import { Injectable, BadRequestException } from '@nestjs/common';

import { UserCrudService, CreateUserDto } from './user-crud.service';

@Injectable()
export class UserValidationService {
  constructor(private readonly crudService: UserCrudService) {}

  private readonly validRoles = ['user', 'admin', 'master'];

  async validateUniqueUsername(username: string): Promise<void> {
    const existingUser = await this.crudService.findOne(username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
  }

  validateRole(role?: string): void {
    if (role && !this.validRoles.includes(role)) {
      throw new BadRequestException(
        `Role must be one of: ${this.validRoles.join(', ')}`,
      );
    }
  }

  validatePassword(password: string): void {
    if (!password || password.length < 3) {
      throw new BadRequestException(
        'Password must be at least 3 characters long',
      );
    }
  }

  validateUsername(username: string): void {
    if (!username || username.length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }
  }

  async validateCreateUser(createUserDto: CreateUserDto): Promise<void> {
    this.validateUsername(createUserDto.username);
    this.validatePassword(createUserDto.password);
    this.validateRole(createUserDto.role);
    await this.validateUniqueUsername(createUserDto.username);
  }
}

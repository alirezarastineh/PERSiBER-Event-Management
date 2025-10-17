import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../auth/auth.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles/roles.guard.js';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface.js';
import { User } from '../users/schemas/users.schema/users.schema.js';
import { UsersService } from '../users/users.service.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Roles('admin', 'master')
  @Get('users')
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Roles('admin', 'master')
  @Delete('user/:id')
  async deleteUser(
    @Param('id') userId: string,
    @Request() req: RequestWithUser,
  ): Promise<User> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'master' && req.user.role !== 'master') {
      throw new ForbiddenException('Admins cannot delete masters');
    }

    if (
      user.role === 'master' &&
      req.user.role === 'master' &&
      userId !== req.user._id.toString()
    ) {
      throw new ForbiddenException('You cannot delete another master');
    }

    await this.usersService.deleteUser(userId);
    return user;
  }

  @Roles('master')
  @Patch('user/:id/role')
  async updateRole(
    @Param('id') userId: string,
    @Body('role') role: string,
    @Request() req: RequestWithUser,
  ): Promise<User> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only masters can update roles
    if (req.user.role !== 'master') {
      throw new ForbiddenException('Only masters can update user roles');
    }

    if (role === 'master' || user.role === 'master') {
      throw new ForbiddenException(
        'You cannot assign or remove the master role',
      );
    }

    await this.authService.updateRole(userId, role);
    const updatedUser = await this.usersService.findById(userId);

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }
}
